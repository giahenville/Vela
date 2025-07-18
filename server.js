require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
require("./src/config/passport"); // Make sure this path is correct


const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./src/db");
const userRouter = require("./src/routes/user"); // Adjust path if needed
const apiRoutes = require("./src/routes/api");

// Middleware to parse JSON and URL-encoded data (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
  })
);

// Passport setup (after session)
app.use(passport.initialize());
app.use(passport.session());

// Make session user available to all EJS views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

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
  res.render("login", { error: null }); // send null by default
});

// Create-Account page
app.get("/create-account", (req, res) => {
  res.render("create-account");
});

// Protected pages
app.get("/home", requireLogin, (req, res) => res.render("home"));
app.get("/progress", requireLogin, (req, res) => res.render("progress"));
app.get("/insights", requireLogin, (req, res) => res.render("insights"));
app.get("/wellness-tips", requireLogin, (req, res) =>
  res.render("wellness-tips")
);
app.get("/ai-checkup", requireLogin, (req, res) => res.render("ai-checkup"));

// ======= AUTH Handlers ======

// Login handler
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).render("login", { error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

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
    res
      .status(500)
      .render("login", { error: "Something went wrong. Please try again." });
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


// === Google OAuth Routes ===
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.loggedIn = true;
    req.session.user = {
      id: req.user.id,
      username: req.user.displayName,
      email: req.user.email,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    };
    res.redirect("/home");
  }
);


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
