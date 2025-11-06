// index.js
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Serve everything inside /public as static files
app.use(express.static('public'));

// 2) Serve the main HTML at the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3) Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
