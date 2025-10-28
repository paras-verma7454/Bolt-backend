import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Confirmed for October 2025
});

// const groundingTool = {
//   googleSearch: {},
// };

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const CodeGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  // tools: [groundingTool], // <-- Grounding enabled here!
};

export const chatSession = model.startChat({
  generationConfig,
  history: [],
});

// const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
// console.log(result.response.text());

export const GenAICode = model.startChat({
  generationConfig: CodeGenerationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: `
Generate a React app project. Create multiple components, organize in separate folders with .js files as needed. Use Tailwind CSS. Use only 'lucide-react' icons when needed and 'date-fns', 'react-chartjs-2' ONLY if necessary.

Respond ONLY with valid JSON:
{
  "projectTitle": "",
  "explanation": "",
  "files": { "/App.js": { "code": "" }, ... },
  "generatedFiles": []
}
- Do NOT wrap JSON in quotes or escape
- Do NOT include \\n or \\"
- Only link to remote images (no downloads)
- Add emoji icons for UX if needed
- Make design visually impressive (spacing, padding, shadows, cards, lucide-react icons as logos if needed)
- Exclude 'src' folder, update package.json if project created
`
          },
        ]
      }
    ]
  });
}
