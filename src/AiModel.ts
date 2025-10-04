import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Confirmed for October 2025
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
          text:
            `Generate a Project in React app. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.
            Also you can use date-fns for date format and react-chartjs-2 chart, graph library.
            Generate a Project in React app...
Return ONLY a valid JSON object following this schema exactly:
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": { "code": "" },
    ...
  },
  "generatedFiles": []
}
Do NOT wrap the JSON inside quotes.
Do NOT escape characters or include \\n or \\\".
Return the JSON object directly, not as a string.
            `
        },
      ],
    },
  ],
});
