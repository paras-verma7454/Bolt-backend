import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { GenAICode } from "./AiModel";

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

const aiCodeRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(12000),
});

app.use(express.json());
app.use(cors());

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
        const result = await GenAICode.sendMessage(prompt);
        const responseText = await result.response.text();

        try {
      const jsonResponse = parseModelJsonResponse(responseText);
      const validatedResponse = generatedProjectSchema.parse(jsonResponse);
      res.json(validatedResponse);
        } catch (parseError) {
        res.status(502).json({
        error: "Model returned invalid JSON payload",
          details: parseError instanceof Error ? parseError.message : "Unknown parse error",
          rawText: responseText,
        });
        }
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
