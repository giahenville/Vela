require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./src/db");
const userRouter = require("./src/routes/user"); // Adjust path if needed
const apiRoutes = require("./src/routes/api");
const eventsRouter = require("./src/routes/events");

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend and public folders
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "public")));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Make session user available to all EJS views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use("/api/events", eventsRouter);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login?redirected=true");
  }
}

// ==== ROUTES ====

// Landing page
app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/home");
  } else {
    res.render("index");
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Create Account page
app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Home page (protected)
app.get("/home", requireLogin, (req, res) => res.render("home"));

// Login handler
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).render("login", { error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password_hash); // fixed property name

    if (!valid) {
      return res.status(400).render("login", { error: "Invalid password" });
    }

    // Success: store user in session
    req.session.loggedIn = true;
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.redirect("/home");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", { error: "Something went wrong. Please try again." });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// API routes
app.use("/api/users", userRouter);
app.use("/api", apiRoutes);

// ====== DB Test ======
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("Database time:", res.rows[0]);
  } catch (err) {
    console.error("Database query error", err);
  }
})();

// ====== Start server =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
