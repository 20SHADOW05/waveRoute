const radioBrowser = require('radio-browser');
const https = require('https');

// Patch the global agent to include user-agent
const originalRequest = https.request;
https.request = function(options, callback) {
    if (!options.headers) options.headers = {};
    options.headers['User-Agent'] = 'waveRoute/1.0';
    return originalRequest.call(this, options, callback);
};

const initialStations = async () => {
    
    let filter = {
        limit: 200,
        by: 'topvote'
    }

    try {
        const data = await radioBrowser.getStations(filter);
        console.log('data arrived');
        return data;
    } catch(error) {
        console.log(error);
        return [];
    }

}

module.exports = initialStations;
