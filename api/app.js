const express = require('express');
const app = express();
const cors = require('cors');

const NodeCache = require('node-cache');
const myCache = new NodeCache( {stdTTL: 86400 , checkperiod: 86420} );

const fetchStations = require('./stations');

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/getStations' , async (req , res) => {
    try {
        if(myCache.has("stationsData")) {
            console.log("GOT IT FROM CACHE");
            return res.json(myCache.get("stationsData"));
        }
        else {
            const stationsData = await fetchStations();
            if(stationsData != null){
                myCache.set("stationsData" , stationsData);
                return res.json(stationsData);
            } 
            else throw new Error("radio-browser api server error");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);