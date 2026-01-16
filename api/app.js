const express = require('express');
const cors = require('cors');
const app = express();
const initialStations = require('./stations');

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/initialStations' , async (req , res) => {
    try {
        let stationsData = await initialStations();
        stationsData = stationsData.filter(station => {
            const lat = parseFloat(station.geo_lat);
            const lng = parseFloat(station.geo_long);
            
            return station.geo_lat != null && 
                   station.geo_long != null && 
                   !isNaN(lat) && 
                   !isNaN(lng) &&
                   lat !== 0 && 
                   lng !== 0 &&
                   lat >= -90 && 
                   lat <= 90 &&
                   lng >= -180 && 
                   lng <= 180;
        });
        res.json(stationsData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);