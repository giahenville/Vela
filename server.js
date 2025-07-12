const express = require('express');
const path = require('path');
const app = express();
const apiRoutes = require('./src/routes/api');

const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware to parse JSON
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Route for the root path to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Serve component pages
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
