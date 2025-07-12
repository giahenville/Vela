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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
