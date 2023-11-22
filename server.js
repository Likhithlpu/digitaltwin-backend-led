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

// Endpoint to handle incoming data for node 1
app.post('/incoming-data', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',')
  	.map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
        const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

        console.log('Formatted timestamp:', formattedTimestamp);

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO sensor_data (timestamp, current_led_red, current_led_green, current_led_blue, saved_sensor_red, saved_sensor_green, saved_sensor_blue, saved_clear, saved_color_temp, saved_lux) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [
                formattedTimestamp,
                conValues[0], // current_led_red
                conValues[1], // current_led_green
                conValues[2], // current_led_blue
                conValues[3], // saved_sensor_red
                conValues[4], // saved_sensor_green
                conValues[5], // saved_sensor_blue
                conValues[6], // saved_clear
                conValues[7], // saved_color_temp
                conValues[8]  // saved_lux
            ]
        );

        console.log('Data inserted successfully:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully.');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Subscription for node 2
app.post('/incoming-data-2', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',')
  	.map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
        const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

        console.log('Formatted timestamp:', formattedTimestamp);

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO sensor_data_2 (timestamp, current_led_red, current_led_green, current_led_blue, saved_sensor_red, saved_sensor_green, saved_sensor_blue, saved_clear, saved_color_temp, saved_lux,act) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING *',
            [
                formattedTimestamp,
                conValues[0], // current_led_red
                conValues[1], // current_led_green
                conValues[2], // current_led_blue
                conValues[3], // saved_sensor_red
                conValues[4], // saved_sensor_green
                conValues[5], // saved_sensor_blue
                conValues[6], // saved_clear
                conValues[7], // saved_color_temp
                conValues[8], // saved_lux
                conValues[9]  // act bool value
            ]
        );

        console.log('Data inserted successfully:', result.rows[0]);
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

app.get('/latest-data-node2', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM sensor_data_2 ORDER BY timestamp DESC LIMIT 1'
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

        // Get the current epoch time
        const epoch = Math.floor(Date.now() / 1000);

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
                'con': `${epoch},${red},${green},${blue},1`
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
