const express = require("express");
const router = express.Router();
const db = require("../db");

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session.loggedIn && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// GET /api/events - get all events for current user
router.get("/", requireLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await db.query(
      "SELECT * FROM events WHERE user_id = $1 ORDER BY start_time",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Server error fetching events" });
  }
});

// POST /api/events - add a new event
router.post("/", requireLogin, async (req, res) => {
  const { title, description, start_time, end_time } = req.body;
  const userId = req.session.user.id;

  if (!title || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO events (user_id, title, description, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, description || "", start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ error: "Server error adding event" });
  }
});

module.exports = router;
