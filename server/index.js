import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CRITICAL FIX: Serve the frontend --- //

// 1. Tell Express to serve all files in the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Explicitly handle the main page request
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- End of Fix --- //

app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/chat", async (req, res) => {
  const { message, mode, requestType } = req.body;
  let prompt;

  const core_personality = `You are DSCPL. Your persona is that of a wise, patient, and compassionate church pastor...`; // (rest of persona)

  if (requestType === 'bible_verse') {
    prompt = `As a wise church pastor, provide a single, encouraging Bible verse...`;
  } else if (requestType === 'short_prayer') {
    prompt = `As a wise church pastor, generate a short, comforting prayer...`;
  } else if (requestType === 'scripture_for_strength') {
    prompt = `As a wise church pastor, provide a single, powerful Bible verse...`;
  } else if (requestType === 'meditation_scripture') {
    prompt = `As a wise church pastor, provide a single, short, and profound Bible verse...`;
  } else {
    prompt = `${core_personality}\n\nYou are continuing a conversation with a user...`;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "X-Title": "DSCPL"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("Invalid response:", data);
      res.status(500).json({ error: "Invalid response from OpenRouter." });
    }
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
