const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const db = require("../db"); // adjust path if needed

// Initialize OpenAI client (put your key in env variable OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "No message provided" });

  // Check if user is logged in
  if (!req.session.loggedIn || !req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Fetch user's onboarding data from DB
    const userId = req.session.user.id;
    const userResult = await db.query(
      `SELECT mental_health_status, preferred_pacing, avoid_times, notes FROM users WHERE id = $1`,
      [userId]
    );

    const userData = userResult.rows[0] || {};

    // Build system prompt with user-specific info
    const systemPrompt = `
You are a compassionate AI assistant specialized in mental health, productivity, and scheduling.
User's mental health status: ${userData.mental_health_status || "Not specified"}.
Preferred pacing: ${userData.preferred_pacing || "No preference"}.
Times to avoid scheduling: ${userData.avoid_times || "None"}.
Additional notes: ${userData.notes || "None"}.

Always consider these when assisting the user with scheduling and productivity advice.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or your preferred model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
    });

    // Log tokens usage for debugging/monitoring
    console.log("Prompt tokens:", completion.usage.prompt_tokens);
    console.log("Completion tokens:", completion.usage.completion_tokens);
    console.log("Total tokens:", completion.usage.total_tokens);

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "OpenAI API request failed" });
  }
});

module.exports = router;
