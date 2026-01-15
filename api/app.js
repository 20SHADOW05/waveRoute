const express = require('express');
const app = express();
const initialStations = require('./stations');

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));

app.get('/initialStations' , async (req , res) => {
    try {
        const stationsData = await initialStations();
        res.json(stationsData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);