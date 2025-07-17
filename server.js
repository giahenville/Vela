require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./src/db");
const userRouter = require("./src/routes/user"); // Adjust path if needed
const apiRoutes = require("./src/routes/api");

// Middleware to parse JSON and URL-encoded data (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For debugging incoming request bodies
app.use((req, res, next) => {
  console.log("Incoming request body:", req.body);
  next();
});

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

// Session config
app.use(
  session({
    secret: "your-secret-key", // replace this with a strong secret in prod
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login?redirected=true");
  }
}

// ==== View engine setup ====
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
  res.render("login");
});

// Create Account page
app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Home (dashboard)
app.get("/home", requireLogin, (req, res) => {
  res.render("home");
});

// Other protected views
app.get("/progress", requireLogin, (req, res) => res.render("progress"));
app.get("/insights", requireLogin, (req, res) => res.render("insights"));
app.get("/wellness-tips", requireLogin, (req, res) => res.render("wellness-tips"));
app.get("/ai-checkup", requireLogin, (req, res) => res.render("ai-checkup"));

// Login handler
app.post("/login", (req, res) => {
  // TODO: Add real credential validation
  req.session.loggedIn = true;
  res.redirect("/home");
});

// Logout handler
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// API routes
app.use("/api/users", userRouter);
app.use("/api", apiRoutes);

// Connect to DB and test query once on startup
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("Database time:", res.rows[0]);
  } catch (err) {
    console.error("Database query error", err);
  }
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
