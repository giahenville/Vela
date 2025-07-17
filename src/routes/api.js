const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// Initialize OpenAI client (put your key in env variable OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage)
    return res.status(400).json({ error: "No message provided" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or 'gpt-4', 'gpt-3.5-turbo'
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant specialized in mental health, productivity, and scheduling.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
    });

    // Log token usage here
    console.log("Prompt tokens:", completion.usage.prompt_tokens);
    console.log("Completion tokens:", completion.usage.completion_tokens);
    console.log("Total tokens:", completion.usage.total_tokens);

    console.log('Full completion response:', completion);

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "OpenAI API request failed" });
  }
});

module.exports = router;
