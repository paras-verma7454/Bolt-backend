import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { createCodeGenerationChat } from "./AiModel";

dotenv.config();

const app = express();

interface AiCodeRequestBody {
  prompt?: string;
}

const generatedProjectSchema = z.object({
  projectTitle: z.string(),
  explanation: z.string(),
  files: z.record(z.object({ code: z.string() })),
  generatedFiles: z.array(z.string()),
}).superRefine((payload, ctx) => {
  const fileKeys = Object.keys(payload.files);
  const generatedSet = new Set(payload.generatedFiles);
  const fileSet = new Set(fileKeys);

  if (generatedSet.size !== fileSet.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "generatedFiles must include every files key exactly once",
      path: ["generatedFiles"],
    });
    return;
  }

  for (const key of fileKeys) {
    if (!generatedSet.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing file path in generatedFiles: ${key}`,
        path: ["generatedFiles"],
      });
      return;
    }
  }
});

type GeneratedProject = z.infer<typeof generatedProjectSchema>;

const aiCodeRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(12000),
});

app.use(express.json());
app.use(cors());

app.use((error: unknown, _req: Request, res: Response, next: express.NextFunction) => {
  const isBodyParserSyntaxError =
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error;

  if (isBodyParserSyntaxError) {
    res.status(400).json({
      error: "Invalid JSON body",
      details: "Request body must be valid JSON. Example: {\"prompt\":\"...\"}",
    });
    return;
  }

  next(error);
});

const stripJsonCodeFence = (text: string): string => {
  const trimmed = text.trim();
  const withoutStartFence = trimmed.replace(/^```(?:json)?\s*/i, "");
  return withoutStartFence.replace(/```\s*$/i, "").trim();
};

const extractLikelyJson = (text: string): string => {
  const cleaned = stripJsonCodeFence(text);
  const firstObjectStart = cleaned.indexOf("{");
  const firstArrayStart = cleaned.indexOf("[");

  const starts = [firstObjectStart, firstArrayStart].filter((index) => index >= 0);
  if (starts.length === 0) {
    return cleaned;
  }

  const startIndex = Math.min(...starts);
  const startsWithObject = cleaned[startIndex] === "{";
  const endChar = startsWithObject ? "}" : "]";
  const endIndex = cleaned.lastIndexOf(endChar);

  if (endIndex <= startIndex) {
    return cleaned;
  }

  return cleaned.slice(startIndex, endIndex + 1).trim();
};

const parseModelJsonResponse = (text: string): unknown => {
  const cleaned = extractLikelyJson(text);
  return JSON.parse(cleaned);
};

const isDashboardLikePrompt = (prompt: string): boolean => {
  return /(dashboard|portal|admin|management|analytics|gym|saas|crm)/i.test(prompt);
};

const validateQualityForPrompt = (prompt: string, payload: GeneratedProject): string[] => {
  const issues: string[] = [];
  const filePaths = Object.keys(payload.files);
  const allCode = Object.values(payload.files)
    .map((f) => f.code)
    .join("\n");

  if (filePaths.length < 4) {
    issues.push("Output has too few files");
  }

  const hasJsOrJsx = filePaths.some((path) => /\.(js|jsx)$/i.test(path));
  if (hasJsOrJsx) {
    issues.push("React output must use TypeScript files (.tsx/.ts), not .js/.jsx");
  }

  if (isDashboardLikePrompt(prompt)) {
    if (filePaths.length < 10) {
      issues.push("Dashboard output needs at least 10 files for production-grade architecture");
    }

    if (!filePaths.includes("/App.tsx")) {
      issues.push("Dashboard output must include /App.tsx as root entry point");
    }

    const componentCount = filePaths.filter((path) => path.startsWith("/components/")).length;
    if (componentCount < 5) {
      issues.push("Dashboard output should include at least 5 component files in /components/");
    }

    const hasChartImport = /recharts|chart\.js|plotly|nivo|visx|d3|BarChart|LineChart|AreaChart/i.test(allCode);
    const hasChartFile = filePaths.some((path) => /chart|analytics|metrics|visualization/i.test(path));
    if (!hasChartImport && !hasChartFile) {
      issues.push("Dashboard output should include chart visualization components (import from recharts or similar)");
    }

    const hasTheme = filePaths.some((path) => /theme|style|token|constant|config/i.test(path));
    if (!hasTheme) {
      issues.push("Dashboard output should include design tokens or theme configuration file");
    }

    const hasLayout = filePaths.some((path) => /sidebar|header|layout|navigation|topbar/i.test(path));
    if (!hasLayout) {
      issues.push("Dashboard output should include layout components (sidebar/header/navigation)");
    }
  }

  return issues;
};

const generateProjectFromPrompt = async (prompt: string): Promise<GeneratedProject> => {
  const chat = createCodeGenerationChat();
  const firstResult = await chat.sendMessage(prompt);
  const firstResponseText = await firstResult.response.text();
  const firstJson = parseModelJsonResponse(firstResponseText);
  const firstValidated = generatedProjectSchema.parse(firstJson);
  const firstIssues = validateQualityForPrompt(prompt, firstValidated);

  if (firstIssues.length === 0) {
    return firstValidated;
  }

  const issuesList = firstIssues
    .map((issue) => `  • ${issue}`)
    .join("\n");

  const retryPrompt = `CRITICAL RETRY INSTRUCTION - Fix these exact issues:

${issuesList}

Requirements for this retry:
1. ALL files must use .tsx or .ts extensions only.
2. /App.tsx must exist as the main entry point.
3. Minimum 10 total files with clear /components, /lib, /pages, /types structure.
4. Dashboard must have: Sidebar, Header, KPI cards, Charts (using recharts), tables, analytics views.
5. Return ONLY valid JSON with no markdown, no fences, no escaped text.
6. Ensure components are typed and production-ready.
7. Include design tokens file for consistency.
8. generatedFiles must list every file key exactly once in alphabetical order.

Regenerate the entire project now with these fixes applied.`;

  const retryResult = await chat.sendMessage(retryPrompt);
  const retryResponseText = await retryResult.response.text();
  const retryJson = parseModelJsonResponse(retryResponseText);
  const retryValidated = generatedProjectSchema.parse(retryJson);
  const retryIssues = validateQualityForPrompt(prompt, retryValidated);

  if (retryIssues.length > 0) {
    throw new Error(
      `Low-quality generation after retry. Remaining issues:\n${retryIssues.map((issue) => `  • ${issue}`).join("\n")}`
    );
  }

  return retryValidated;
};



app.get('/ai-code', (_req: Request, res: Response) => {
    res.json({ message: "Send a POST request to this endpoint with a prompt to generate AI code." });
});

app.post('/ai-code', async (req: Request<{}, {}, AiCodeRequestBody>, res: Response): Promise<void> => {
  const parsedRequest = aiCodeRequestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({
      error: "Invalid prompt",
      details: parsedRequest.error.flatten(),
    });
    return;
    }

  const { prompt } = parsedRequest.data;

    try {
      const validatedResponse = await generateProjectFromPrompt(prompt);
      res.json(validatedResponse);
  } catch (error: unknown) {
        console.error("Error in /ai-code:", error);
        res.status(500).json({ 
            error: "Error sending message", 
      details: error instanceof Error ? error.message : "Unknown error" 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
