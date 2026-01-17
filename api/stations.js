const axios = require('axios');
const { application } = require('express');

const fetchStations = async () => {

    let server_url = "https://de1.api.radio-browser.info";
    const headers = {
        'User-Agent': 'waveRoute/1.0 (angrymartian68@gmail.com)',
        'Content-Type': 'application/json'
    };

    try {
        const stationsData = await axios.get(`${server_url}/json/stations/search?limit=5&hidebroken=true` , { headers , timeout: 10000 });
        console.log(stationsData);
        console.log("DATA FETCHED");
        return stationsData.data;
    } catch(error) {
        console.log(error);
    }
} 

module.exports = fetchStations;