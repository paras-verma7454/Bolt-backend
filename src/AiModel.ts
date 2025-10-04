import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// ✅ Load API key securely
const apiKey = process.env.GEMINI_API_KEY as string;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY not found in environment variables.");
}

// ✅ Initialize Gemini client
const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Choose the Gemini model version
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // or "gemini-1.5-pro" for higher accuracy
});

// ✅ Enable Google Search grounding
const groundingTool = {
  googleSearch: {},
};

// ✅ Configuration for normal chat/text generation
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
  tools: [groundingTool], // 🔍 Google Search enabled
};

// ✅ Configuration for structured code generation
const CodeGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  tools: [groundingTool], // 🔍 Optional grounding for code prompts
};

// ✅ Chat session for general chat/text generation
export const chatSession = model.startChat({
  generationConfig,
  history: [],
});

// ✅ Chat session for code-generation or structured prompts
export const GenAICode = model.startChat({
  generationConfig: CodeGenerationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `Generate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary.

Return the response in JSON format with the following schema:
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": { "code": "" },
    ...
  },
  "generatedFiles": []
}

Ensure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field. Use date-fns, chart.js, and react-chartjs-2 if needed, and link images via URL without downloading them.`,
        },
      ],
    },
  ],
});

// ✅ Example: run this file directly (for testing)
if (require.main === module) {
  (async () => {
    try {
      const prompt = "Summarize the benefits of Tailwind CSS for React developers.";
      const result = await chatSession.sendMessage(prompt);
      console.log("✅ Gemini Response:\n", result.response.text());
    } catch (error: any) {
      console.error("❌ Gemini API Error:", error?.response?.data || error.message);
    }
  })();
}
