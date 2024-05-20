require('dotenv').config();
require('./scheduledTasks');
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser'); // Add this line

const loginRoutes = require('./login');
const productosRoutes = require('./productoCRUD');
const compare = require('./excelStorage');
const app = express();

// Middleware to parse JSONaaa
app.use(bodyParser.json({ limit: '50mb' })); // Increase the limit here
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase the limit here

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:9002/', 'https://stocksystemfront-ecak.onrender.com'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Specific routes
app.use(productosRoutes);
app.use(loginRoutes);
app.use(compare);

// Catch all other routes and redirect to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

console.log('dirname', __dirname);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '::', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
