const axios = require('axios');
const iso1A2Code = require('@rapideditor/country-coder').iso1A2Code;

const fetchStations = async () => {

    let server_url = "https://de1.api.radio-browser.info";
    const headers = {
        'User-Agent': 'waveRoute/1.0',
        'Content-Type': 'application/json'
    };

    try {
        const stationsData = await axios.get(`${server_url}/json/stations/search?limit=6000&hidebroken=true&has_geo_info=true&order=clickcount&reverse=true` , { headers , timeout: 20000 });
        // console.log(stationsData.data.length);
        // console.log("DATA FETCHED");
        const GeoJSON = convertGeoJSON(stationsData.data);
        return GeoJSON;
    } catch(error) {
        console.error("Fetch error:", error.message);
        return null;
    }
}

const convertGeoJSON = (allStations) => {
    const features = [];

    for(const station of allStations){
        if(validateStation(station)){
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(station.geo_long), parseFloat(station.geo_lat)]
                },
                properties: {
                    id: station.stationuuid,
                    name: station.name.split('-').slice(0, 2).join(' - '),
                    country: station.country,
                    countryCode: station.countrycode,
                    state: station.state,
                    streamUrl: station.url_resolved || station.url,
                    tags: station.tags
                        ? station.tags.split(',').map(t => t.trim().toLowerCase())
                        : [],
                    language: station.language,
                    codec: station.codec,
                    bitrate: station.bitrate,
                    votes: station.votes,
                    favicon: station.favicon 
                }
            })
        }
    }

    const GeoJSON = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: features
        }        
    }

    return GeoJSON;
}

const validateStation = (station) => {
    let longitude = parseFloat(station.geo_long);
    let latitude = parseFloat(station.geo_lat);

    if(isNaN(longitude) || isNaN(latitude)) return false;
    if(longitude === 0 && latitude === 0) return false;

    try {
        let detectedCountry = iso1A2Code([longitude, latitude]);
        if(!detectedCountry) return false;
        if(detectedCountry !== station.countrycode && station.countrycode) return false;
    } catch (error) {
        // console.log(`Error detecting country for ${station.name}:`, error.message);
        return false;
    }

    return true;
}

module.exports = fetchStations;