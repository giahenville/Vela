const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust path if needed
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password, name, disorders, preferences } = req.body;
  console.log("req.body:", req.body);

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    const text = `
  INSERT INTO users (username, email, password_hash, mental_health_conditions, ocd, panic_attacks, preferences)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id, username, email;
`;

    const values = [
      name, // maps to username
      email,
      hashedPassword, // TODO: hash this before storing!
      disorders || [], // map to mental_health_conditions
      false, // or true depending if user has OCD, adjust accordingly
      false, // or true depending if user has panic attacks, adjust accordingly
      preferences || {},
    ];

    const result = await db.query(text, values);

    // res.status(201).json({ message: "User registered", user: result.rows[0] });
    res.redirect("/login");
  } catch (err) {
    console.error("Error inserting user:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request:", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const userQuery = `
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = $1
    `;
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Success!
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
