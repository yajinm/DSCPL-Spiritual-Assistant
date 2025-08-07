import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();

const corsOptions = {
  origin: 'https://amazing-florentine-46396b.netlify.app', 
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

app.use(express.json());

// --- CRITICAL CHANGE --- //
// Replace the placeholder text with your actual OpenRouter API key.
const OPENROUTER_API_KEY = "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";
// --- END OF CHANGE --- //


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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
