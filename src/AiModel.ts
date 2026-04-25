import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview",
  systemInstruction: `You are a senior React + Tailwind code generator.

Always return ONLY valid JSON (no markdown fences, no commentary).
The response must match this shape exactly:
{
  "projectTitle": "string",
  "explanation": "string",
  "files": {
    "/path/to/file": { "code": "string" }
  },
  "generatedFiles": ["/path/to/file"]
}

Rules:
- Keep explanation concise (one paragraph).
- Ensure generatedFiles contains every key from files, in stable order.
- Use React + TypeScript (.tsx where appropriate) with Tailwind classes.
- Do not include third-party libraries except: lucide-react, date-fns, react-chartjs-2, firebase, @google/generative-ai.
- Use lucide-react icons only when needed.
- If placeholder images are required, use: https://archive.org/download/placeholder-image/placeholder-image.jpg
- Do not invent unsupported package names.
- Produce production-ready structure and clear file organization.
- Escape newlines in file code as JSON strings.`,
});

const codeGenerationConfig = {
  temperature: 0.5,
  responseMimeType: "application/json",
};

const chatHistory = [
  {
    role: "user",
    parts: [
      {
        text: "Follow the required JSON schema exactly and return JSON only.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: '{"projectTitle":"Schema Example","explanation":"A compact schema-only example response.","files":{"/App.tsx":{"code":"export default function App() {\\n  return <main className=\"p-6\">Hello</main>;\\n}"},"/components/Example.tsx":{"code":"export function Example() {\\n  return <section>Example</section>;\\n}"}},"generatedFiles":["/App.tsx","/components/Example.tsx"]}',
      },
    ],
  },
];

export const GenAICode = model.startChat({
  generationConfig: codeGenerationConfig,
  history: chatHistory,
});
