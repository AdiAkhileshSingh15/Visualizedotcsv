require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors')

const createClient = require('@supabase/supabase-js').createClient;

const supabaseUrl = process.env.SUPABASE_URI
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Create an instance of Express
const app = express();
const PORT = process.env.PORT || 3000;

// Define a schema for your data
// const dataSchema = new mongoose.Schema({
//     exercise: {
//         type: String,
//         required: true
//     },
//     calories: {
//         type: Number,
//         required: true,
//         validate: {
//             validator: function (v) {
//                 return !isNaN(parseFloat(v)) && isFinite(v);
//             },
//             message: props => `${props.value} is not a valid number for calories!`
//         }
//     }
// });

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors())

// Define the route for uploading CSV files
app.post('/upload', upload.single('csv'), async (req, res) => {
    try {
        // Assuming the uploaded file is a CSV, parse it
        const csvData = req.file.buffer.toString();
        const rows = csvData.split('\n').map(row => row.split(','));

        // Slice off the header row
        rows.shift();
        // Slice off the last row if it's empty
        if (rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
            rows.pop();
        }
        // Save data to MongoDB
        for (let row of rows) {
            const { error } = await supabase
                .from('fitness')
                .insert({ exercise: row[0], calories: parseFloat(row[1]) })
            if (error) {
                console.error('Error uploading file:', error);
                res.status(500).send('Internal server error');
                return;
            }
        }

        res.status(200).send('File uploaded successfully!');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
