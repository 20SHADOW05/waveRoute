const express = require('express');
const app = express();
const cors = require('cors');

const NodeCache = require('node-cache');
const myCache = new NodeCache( {stdTTL: 120 , checkperiod: 140} );

const fetchStations = require('./stations');

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/' , async (req , res) => {
    try {
        if(myCache.has("stationsData")) {
            console.log(myCache.get("stationsData"));
            console.log("GOT IT FROM CACHE");
        }
        else {
            const stationsData = await fetchStations();
            myCache.set("stationsData" , stationsData);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);