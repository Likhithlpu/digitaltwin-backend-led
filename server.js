const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const PORT = process.env.PORT || 3486;

// Middleware to parse incoming JSON data
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'digitaltwin',
    password: 'postgres',
    port: 5432,
});

// Endpoint to handle incoming data
app.post('/incoming-data', async (req, res) => {
    try {
        // ... (your existing code)

        res.status(200).send('Data received and inserted successfully.');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get the latest data
app.get('/latest-data', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1'
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching latest data from PostgreSQL:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
