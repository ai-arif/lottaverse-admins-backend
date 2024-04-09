require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const db= require('./db_config/db');
const app = express();

// Connect to the database
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to the database');
});
// Enable CORS
app.use(cors());

// Define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Define a route handler for the /leaderboard route
app.use('/api', apiRoutes);

// Get the port from the environment variables or use 5000 as a default
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});