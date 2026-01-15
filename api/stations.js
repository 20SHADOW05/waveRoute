const RadioBrowser = require('radio-browser');

const initialStations = async () => {
    
    let filter = {
        limit : 50,
        by : 'topvote'
    }

    try {
        const data = await RadioBrowser.getStations(filter);
        console.log(data);
        return data;
    } catch(error) {
        console.log(error);
        return [];
    }

}

module.exports = initialStations;

