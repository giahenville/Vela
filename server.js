require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const apiRoutes = require('./src/routes/api');
const PORT = process.env.PORT || 3000;

// ==== View engine setup ====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// ==== Middleware ====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Session config
app.use(session({
  secret: 'your-secret-key', // replace this with a real secret
  resave: false,
  saveUninitialized: true
}));

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login?redirected=true');
  }
}

// ==== ROUTES ====

// Landing page
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    res.render('index'); // views/index.ejs
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login'); // views/login.ejs
});

// Create Account
app.get('/create-account', (req, res) => {
  res.render('create-account'); // views/create-account.ejs
});

// Home (dashboard)
app.get('/home', requireLogin, (req, res) => {
  res.render('home'); // views/home.ejs
});

// Other views (protected)
app.get('/progress', requireLogin, (req, res) => {
  res.render('progress');
});

app.get('/insights', requireLogin, (req, res) => {
  res.render('insights');
});

app.get('/wellness-tips', requireLogin, (req, res) => {
  res.render('wellness-tips');
});

app.get('/ai-checkup', requireLogin, (req, res) => {
  res.render('ai-checkup');
});

// Login handler
app.post('/login', (req, res) => {
  // TODO: Validate credentials here before setting session
  req.session.loggedIn = true;
  res.redirect('/home');
});

// Logout handler
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


// API Routes (e.g., /api/...)
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
