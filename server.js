const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const apiRoutes = require('./src/routes/api');
const PORT = process.env.PORT || 3000;

// Middleware
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
    res.redirect('/');
  }
}

// ========== ROUTES ==========

// Landing page (shown if not logged in)
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// Login simulation 
app.post('/login', (req, res) => {
  // Here you would check credentials. For now, assume always successful.
  req.session.loggedIn = true;
  res.redirect('/home');
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Home dashboard (requires login)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

// Other component routes (also protected)
app.get('/progress', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'components', 'progress.html'));
});

app.get('/insights', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'components', 'insights.html'));
});

app.get('/wellness-tips', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'components', 'wellness-tips.html'));
});

app.get('/ai-checkup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'components', 'ai-checkup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/create-account', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'create-account.html'));
});

// API Routes (e.g., /api/...)
app.use('/api', apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
