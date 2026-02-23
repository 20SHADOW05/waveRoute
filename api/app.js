const express = require('express');
const app = express();
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const NodeCache = require('node-cache');
const myCache = new NodeCache( { stdTTL: 0 } );

const fetchStations = require('./stations');

app.use(helmet());
app.use(compression());
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true} ));
app.use(cors({ origin: true }));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const CACHE_KEY = "stationsData";
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
let lastRefresh = 0;
let refreshing = false;

app.get('/getStations' , async (req , res) => {
    try {
        const cachedData = myCache.get(CACHE_KEY);
        if(cachedData) {
            console.log("GOT IT FROM CACHE");

            if (Date.now() - lastRefresh > REFRESH_INTERVAL && !refreshing) {
                console.log("CACHE STALE → refreshing in background");
                refreshStations();
            }

            return res.json(cachedData);
        }
        
        const stationsData = await fetchStations();
        if(stationsData != null){
            myCache.set(CACHE_KEY , stationsData);
            lastRefresh = Date.now();
            return res.json(stationsData);
        } 
        else throw new Error("radio-browser api server error");
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

async function refreshStations() {
    refreshing = true;
    try {
        const stationsData = await fetchStations();
        if (stationsData) {
            myCache.set(CACHE_KEY, stationsData);
            lastRefresh = Date.now();
            console.log("CACHE REFRESHED SUCCESSFULLY");
        }
    } catch (err) {
        console.error("Background refresh failed:", err.message);
    } finally {
        refreshing = false;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT);