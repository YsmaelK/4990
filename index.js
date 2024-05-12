import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config(); // This will load the environment variables from the .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.API_KEY; // Access the API key securely
const MODEL_NAME = "gemini-1.0-pro";
const GENERATION_CONFIG = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

let chat = model.startChat({
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
    history: [],
});

app.post('/chat', async (req, res) => {
    const userInput = req.body.input;
    try {
        const result = await chat.sendMessage(userInput);
        if (result.error) {
            return res.status(500).send({ error: result.error.message });
        }
        const response = result.response.text();
        res.send({ response });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
