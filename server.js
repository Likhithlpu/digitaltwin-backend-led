const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Change here
const PORT = process.env.PORT || 3488;

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

app.post('/incoming-data', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value from /incoming-data:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',')
  	.map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values /incoming-data:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
        const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

        console.log('Formatted timestamp /incoming-data:', formattedTimestamp);

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

        console.log('Data inserted successfully /incoming-data:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully. /incoming-data');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL /incoming-data:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to handle incoming data for node 1
// app.post('/incoming-data', async (req, res) => {
//     try {
//         // Extract data from the received JSON
//         const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
//         console.log('Received data:', JSON.stringify(cin, null, 2));

//         // Log the "con" value
//         const con = cin['con'];
//         console.log('Original con value from /incoming-data:', con);

//         // Parse the "con" values
// 	const conValues = con
//   	.slice(1, -1) // Remove square brackets
//   	.split(',');
//   	// .map(value => parseInt(value.trim(), 10));

//         console.log('Parsed con values /incoming-data:', conValues);

//         // Check if any value is NaN, and handle it accordingly
//         if (conValues.some(isNaN)) {
//             throw new Error('Invalid con values. Please check the format.');
//         }

//         const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
//         const date = new Date(timestamp);
//         date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
//         const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

//         console.log('Formatted timestamp /incoming-data:', formattedTimestamp);

//         // Insert data into PostgreSQL database
//         const result = await pool.query(
//             'INSERT INTO "node1" (timestamp, temperature, uncompensated_TDS, compensated_TDS, voltage_TDS) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [
//                 formattedTimestamp,
//                 conValues[0], // Temperature
//                 conValues[1], // Uncompensated_TDS
//                 conValues[2], // Compensated_TDS
//                 conValues[3], // Voltage_TDS
//                 // conValues[4], // saved_sensor_green
//                 // conValues[5], // saved_sensor_blue
//                 // conValues[6], // saved_clear
//                 // conValues[7], // saved_color_temp
//                 // conValues[8]  // saved_lux
//             ]
//         );

//         console.log('Data inserted successfully /incoming-data:', result.rows[0]);
//         res.status(200).send('Data received and inserted successfully. /incoming-data');
//     } catch (error) {
//         console.error('Error inserting data into PostgreSQL /incoming-data:', error.message);
//         res.status(500).send('Internal Server Error');
//     }
// });

// Subscription for node 2
app.post('/incoming-data2', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value from /incoming-data2:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',');
  	// .map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values /incoming-data2:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
        const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

        console.log('Formatted timestamp /incoming-data2:', formattedTimestamp);

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO "node2" (timestamp, temperature, uncompensated_TDS, compensated_TDS, voltage_TDS) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [
                formattedTimestamp,
                conValues[0], // Temperature
                conValues[1], // Uncompensated_TDS
                conValues[2], // Compensated_TDS
                conValues[3], // Voltage_TDS
                // conValues[4], // saved_sensor_green
                // conValues[5], // saved_sensor_blue
                // conValues[6], // saved_clear
                // conValues[7], // saved_color_temp
                // conValues[8]  // saved_lux
            ]
        );

        console.log('Data inserted successfully /incoming-data2:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully. /incoming-data2');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL /incoming-data2:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Subscription for node 3
app.post('/incoming-data3', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value from /incoming-data3:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',');
  	// .map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values /incoming-data3:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        const timestamp = cin['ct'].replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() + 660); // Add 5 hours and 30 minutes to the timestamp
        const formattedTimestamp = date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

        console.log('Formatted timestamp /incoming-data3:', formattedTimestamp);

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO "node3" (timestamp, temperature, uncompensated_TDS, compensated_TDS, voltage_TDS) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [
                formattedTimestamp,
                conValues[0], // Temperature
                conValues[1], // Uncompensated_TDS
                conValues[2], // Compensated_TDS
                conValues[3], // Voltage_TDS
                // conValues[4], // saved_sensor_green
                // conValues[5], // saved_sensor_blue
                // conValues[6], // saved_clear
                // conValues[7], // saved_color_temp
                // conValues[8]  // saved_lux
            ]
        );

        console.log('Data inserted successfully /incoming-data3:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully. /incoming-data3');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL /incoming-data3:', error.message);
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
        console.error('Error fetching latest data from PostgreSQL /latest-data:', error.message);
        res.status(500).send('Internal Server Error /latest-data');
    }
});

app.get('/latest-data-node2', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM sensor_data_2 ORDER BY timestamp DESC LIMIT 1'
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching latest data from PostgreSQL /latest-data-node2:', error.message);
        res.status(500).send('Internal Server Error /latest-data-node2');
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

        console.log('Data inserted successfully /post-data:', result.rows[0]);

        // Send the data to another server
        const otherServerUrl = 'http://10.3.1.117:8200/~/in-cse/in-name/AE-DT/DT-ACT-1/Data/';
        const otherServerHeaders = {
            'X-M2M-Origin': 'admin:admin',
            'Content-Type': 'application/json;ty=4',
        };

        const otherServerData = {
            'm2m:cin': {
                'con': `[${epoch},${red},${green},${blue}]`
            }
        };

        await fetch(otherServerUrl, {
            method: 'POST',
            headers: otherServerHeaders,
            body: JSON.stringify(otherServerData),
        });

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting data into PostgreSQL or sending to another server /post-data:', error.message);
        res.status(500).send('Internal Server Error /post-data');
    }
});


app.post('/sim-data-1', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value from /sim-data-1:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',')
  	.map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values /sim-data-1:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO sim_data_1 (red, green, blue, sred, sgreen, sblue, sid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [
                conValues[0], // current_led_red
                conValues[1], // current_led_green
                conValues[2], // current_led_blue
                conValues[3], // saved_sensor_red
                conValues[4], // saved_sensor_green
                conValues[5], // saved_sensor_blue
                conValues[6]
            ]
        );

        console.log('Data inserted successfully /sim-data-1:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully. /sim-data-1');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL /sim-data-1:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/sim-data-2', async (req, res) => {
    try {
        // Extract data from the received JSON
        const cin = req.body['m2m:sgn']['m2m:nev']['m2m:rep']['m2m:cin'];
        console.log('Received data:', JSON.stringify(cin, null, 2));

        // Log the "con" value
        const con = cin['con'];
        console.log('Original con value from /sim-data-2:', con);

        // Parse the "con" values
	const conValues = con
  	.slice(1, -1) // Remove square brackets
  	.split(',')
  	.map(value => parseInt(value.trim(), 10));

        console.log('Parsed con values /sim-data-2:', conValues);

        // Check if any value is NaN, and handle it accordingly
        if (conValues.some(isNaN)) {
            throw new Error('Invalid con values. Please check the format.');
        }

        // Insert data into PostgreSQL database
        const result = await pool.query(
            'INSERT INTO sim_data_2 (sred, sgreen, sblue, sid) VALUES ($1, $2, $3, $4) RETURNING *',
            [
                conValues[0], // current_led_red
                conValues[1], // current_led_green
                conValues[2], // current_led_blue
                conValues[3]
            ]
        );

        console.log('Data inserted successfully /sim-data-2:', result.rows[0]);
        res.status(200).send('Data received and inserted successfully. /sim-data-2');
    } catch (error) {
        console.error('Error inserting data into PostgreSQL /sim-data-2:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});