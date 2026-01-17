const axios = require('axios');

const fetchStations = async () => {

    let server_url = "https://de1.api.radio-browser.info";
    const headers = {
        'User-Agent': 'waveRoute/1.0 (angrymartian68@gmail.com)'
    };

    try {
        const stationsData = await axios.get(`${server_url}` , { headers , timeout: 10000 });
        console.log(stationsData);
        console.log(stationsData.data);
    } catch(error) {
        console.log(error);
    }
} 

module.exports = fetchStations;