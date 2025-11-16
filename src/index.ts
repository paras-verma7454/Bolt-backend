import { GenAICode } from "./AiModel";
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/ai-code', (_req: Request, res: Response) => {
    res.json({ message: "Send a POST request to this endpoint with a prompt to generate AI code." });
});

app.post('/ai-code', async (req: Request, res: Response):Promise<any> => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const result = await GenAICode.sendMessage(prompt);
        const responseText = await result.response.text();
        
        try {
            // The response might be wrapped in ```json ... ```
            // const cleanedText = responseText.replace(/^```json\s*/, '').replace(/```$/, '');
            const jsonResponse = JSON.parse(responseText);
            res.json(jsonResponse);
        } catch (parseError) {
            // If parsing fails, send the raw text
            res.json({ text: responseText });
        }
    } catch (error: any) {
        console.error("Error in /ai-code:", error);
        res.status(500).json({ 
            error: "Error sending message", 
            details: error?.message || "Unknown error" 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
