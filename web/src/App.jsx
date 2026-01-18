import { useEffect , useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	let [stationsData , setStationsData] = useState(null)


	useEffect(() => {

		const getStationsData = async () => {
			try {
				const stationsDataPromise = await fetch('http://localhost:3000/getStations'); // fetch returns a promise
				let Data = await stationsDataPromise.json(); // this method is used to read and parse a http response (JSON.parse is only for json string)
				Data.forEach(element => {
					console.log(element);
				});
				setStationsData(Data);
			} catch(error) {
				console.log(error);
			}
		}

		getStationsData();

	} , [])

	useEffect(() => {

		mapRef.current = new maplibregl.Map({
			container: containerRef.current,
			style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // dark mode --> https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
			zoom: 0,
			renderWorldCopies: false,
			attributionControl: false,
			pitchWithRotate: false,
  			dragRotate: false
		});

		return () => {  // don't question this clean up , its required. what if the component unmounts when toggled between 2d and 3d.
			mapRef.current.remove();
		};

  	} , []);

	useEffect(() => {
    if (!mapRef.current || !stationsData?.length) return;
    
    const map = mapRef.current;
    
    const addStations = () => {
        if (map.getSource('stations')) {
            map.removeLayer('station-points');
            map.removeSource('stations');
        }
        
        // Add GeoJSON source
        map.addSource('stations', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: stationsData.map(station => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(station.geo_long), parseFloat(station.geo_lat)]
                    },
                    properties: {
                        name: station.name.split('-').slice(0, 2).join(' - '),
                        country: station.country
                    }
                }))
            }
        });
        
        map.addLayer({
            id: 'station-points',
            type: 'circle',
            source: 'stations',
            paint: {
                'circle-radius': 4,
                'circle-color': '#343435', 
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff'
            }
        });
        
		const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        }).setMaxWidth("300px");

		let currentFeatureCoordinates = undefined;
        map.on('mousemove', 'station-points', (e) => { // thanks to mapLibre docs for this hover popup
            const featureCoordinates = e.features[0].geometry.coordinates.toString();
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;

                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const { name, country } = e.features[0].properties;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Populate the popup and set its coordinates
                // based on the feature found.
                popup.setLngLat(coordinates).setHTML(`<strong>${name}</strong><br>${country || ''}`).addTo(map);
            }
        });

        map.on('mouseleave', 'station-points', () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    };
    
    if (map.isStyleLoaded()) {
        addStations();
    } else {
        map.once('load', addStations);
    }
    
}, [stationsData]);

	return (
		<>
			<div ref={containerRef} style={{ width: '100vw', height: '99.5vh'}}> </div>	
		</>
	);
}

