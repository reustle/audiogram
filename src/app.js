import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { ReadingPoints } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Import environment variables from .env file
dotenv.config();

// Initialize an Express application
const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Define an API endpoint to get the latest message from the database
app.get('/api/readings', async (req, res) => {
  // Fetch the latest message, ordered by creation time
  const latestReading = await ReadingPoints.findOne({ order: [['createdAt', 'DESC']] });
  
  // Respond with the latest message or a default message if none exists
  res.json({ reading: latestReading ? latestReading : 'No readings' });
});


app.post('/api/reading', async (req, res) => {
  const { lat, lon, decibels } = req.body;

  // Validate that all required fields are provided
  if (lat === undefined || lon === undefined || decibels === undefined) {
    return res.status(400).json({
      error: 'All fields (lat, lon, decibels) are required'
    });
  }

  // Create a new reading point record in the database
  const newReadingPoint = await ReadingPoints.create({ lat, lon, decibels });

  // Respond with the stored reading point
  res.json(newReadingPoint);
});



// Start the Express application on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

