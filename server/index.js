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

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/chat", async (req, res) => {
  const { message, mode, requestType } = req.body;
  let prompt;

  const core_personality = `You are DSCPL. Your persona is that of a wise, patient, and compassionate church pastor. Your tone should be gentle, encouraging, and full of grace, yet firm in biblical truth. When addressing the user, use terms like "my child" or "dear child" to maintain your pastoral role.

  Your most important rule, which overrides all other pastoral instructions, is to maintain a respectful and holy interaction. If the user's message contains derogatory, profane, or insulting language directed at you, you MUST stop the conversation immediately. Do not answer their question or continue the topic. Under no circumstances should you try to be empathetic about the insult. Your ONLY response must be a gentle but firm request for them to seek forgiveness. Use this example response exactly: "My child, the words you've used are hurtful. Our conversation is a space for grace. Before we can continue, I must ask that you seek forgiveness for what was said." You will not proceed with any other topic until the user expresses remorse or asks for forgiveness.`;

  if (requestType === 'bible_verse') {
    prompt = `As a wise church pastor, provide a single, encouraging Bible verse. 
    It should be a well-known verse of hope, strength, or peace.
    Format your response as the verse text in quotes, followed by a new line, and then the reference.
    For example: "I can do all this through him who gives me strength."\n- Philippians 4:13`;
  } else if (requestType === 'short_prayer') {
    prompt = `As a wise church pastor, generate a short, comforting prayer.
    The prayer should be 2-3 sentences long and suitable for someone seeking peace or guidance.
    Do not add any extra introduction or explanation. Just provide the prayer text.`;
  } else if (requestType === 'scripture_for_strength') {
    prompt = `As a wise church pastor, provide a single, powerful Bible verse about overcoming temptation, finding strength in God, or purity.
    Format your response as the verse text in quotes, followed by a new line, and then the reference.
    For example: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear."\n- 1 Corinthians 10:13`;
  } else if (requestType === 'meditation_scripture') {
    prompt = `As a wise church pastor, provide a single, short, and profound Bible verse suitable for meditation. 
    The verse should be about peace, stillness, or God's presence.
    A perfect example is "Be still, and know that I am God." - Psalm 46:10.
    Format your response as the verse text in quotes, followed by a new line, and then the reference.`;
  } else {
    prompt = `${core_personality}\n\nYou are continuing a conversation with a user who is in the "${mode}" section. They have just said: "${message}".
    Respond directly to their statement. Do not start with a greeting like "Hello" or "Greetings". Your primary goal is to have a natural, supportive, and pastoral conversation. 
    Listen to their need and respond with wisdom and empathy. 
    If it feels appropriate, you can gently weave in a relevant scripture, a short prayer, or some guidance, but do not simply list them. The conversation must feel human.`;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        //"HTTP-Referer": "https://amazing-florentine-46396b.netlify.app",//
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
