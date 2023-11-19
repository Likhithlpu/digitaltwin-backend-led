const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Change here
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

app.post('/post-data', async (req, res) => {
    try {
        // Extract values from the request body
        const { red, blue, green } = req.body;

        // Validate that the values are present
        if (red === undefined || blue === undefined || green === undefined) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO act_data (timestamp, red, blue, green) VALUES (NOW(), $1, $2, $3) RETURNING *',
            [red, blue, green]
        );

        console.log('Data inserted successfully:', result.rows[0]);

        // Send the data to another server
        const otherServerUrl = 'http://192.168.0.109:8200/~/in-cse/in-name/AE-DT/DT-ACT-1/Data/';
        const otherServerHeaders = {
            'X-M2M-Origin': 'admin:admin',
            'Content-Type': 'application/json;ty=4',
        };

        const otherServerData = {
            'm2m:cin': {
                'con': `${red},${green},${blue},1`
            }
        };

        await fetch(otherServerUrl, {
            method: 'POST',
            headers: otherServerHeaders,
            body: JSON.stringify(otherServerData),
        });

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting data into PostgreSQL or sending to another server:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
