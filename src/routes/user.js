const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  // Destructure onboarding and core registration fields
  const {
    email,
    password,
    name,
    mental_health_status,
    preferred_pacing,
    avoid_times,
    notes,
  } = req.body;

  console.log("req.body:", req.body);

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user already exists
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare the insert query
    const text = `
      INSERT INTO users
      (username, email, password_hash, mental_health_status, preferred_pacing, avoid_times, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email;
    `;

    const values = [
      name,
      email,
      hashedPassword,
      mental_health_status || null,
      preferred_pacing || null,
      avoid_times || null,
      notes || null,
    ];

    const result = await db.query(text, values);

    // Redirect to login page after successful registration
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
    return res.redirect("/login?error=1");
  }

  try {
    const userQuery = `
      SELECT id, username, email, password_hash
      FROM users
      WHERE email = $1
    `;
    const userResult = await db.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.redirect("/login?error=1");
    }

    const user = userResult.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.redirect("/login?error=1");
    }

    // Success! Set session and redirect to home
    req.session.loggedIn = true;
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.redirect("/home");
  } catch (err) {
    console.error("Login error:", err);
    res.redirect("/login?error=1");
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
