const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust path if needed

// For now, password is plain text; later, use hashing!
router.post("/register", async (req, res) => {
  const { email, password, name, disorders, preferences } = req.body;
  console.log("req.body:", req.body);
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const text = `
  INSERT INTO users (username, email, password_hash, mental_health_conditions, ocd, panic_attacks, preferences)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id, username, email;
`;

    const values = [
      name, // maps to username
      email,
      password, // TODO: hash this before storing!
      disorders || [], // map to mental_health_conditions
      false, // or true depending if user has OCD, adjust accordingly
      false, // or true depending if user has panic attacks, adjust accordingly
      preferences || {},
    ];

    const result = await db.query(text, values);

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
