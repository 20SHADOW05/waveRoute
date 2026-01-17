const express = require('express');
const cors = require('cors');
const app = express();
const fetchStations = require('./stations');
const NodeCache = require('node-cache');
const myCache = new NodeCache();

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/' , async (req , res) => {
    try {
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

const PORT = process.env.PORT || 3000;
// app.listen(PORT);