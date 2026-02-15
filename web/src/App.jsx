import { useEffect , useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CustomAudioPlayer } from './audioPlayer.jsx';

export default function Map() {
    const [darkMode, setDarkMode] = useState(true);
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	let [stationsData , setStationsData] = useState(null);

    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle("dark");
        setDarkMode(!darkMode);
    }

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

	// Remove darkMode from map initialization useEffect
    useEffect(() => {
        mapRef.current = new maplibregl.Map({
            container: containerRef.current,
            style: document.documentElement.classList.contains('dark') 
                ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
                : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            zoom: 0,
            renderWorldCopies: false,
            attributionControl: false,
            pitchWithRotate: false,
            dragRotate: false
        });

        return () => {
            mapRef.current.remove();
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        const newStyle = darkMode 
            ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
        
        mapRef.current.setStyle(newStyle);
    }, [darkMode]);

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
                            country: station.country,
                            state: station.state,
                            streamUrl: station.url_resolved || station.url  
                        }
                    }))
                }
            });
            
            map.addLayer({
                id: 'station-points',
                type: 'circle',
                source: 'stations',
                paint: document.documentElement.classList.contains('dark') ?
                        {
                            'circle-radius': 4,
                            'circle-color': 'rgb(190, 190, 190)', 
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#000000'
                        } 
                        : {
                            'circle-radius': 4,
                            'circle-color': 'rgb(80, 80, 80)', 
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

                    // Populate the popup and set its coordinates based on the feature found.
                    popup.setLngLat(coordinates).setHTML(`${name} 
                        <div class="cName">${country || ''}</div>`).addTo(map);
                }
            });

            map.on('mouseleave', 'station-points', () => {
                currentFeatureCoordinates = undefined;
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        };
        
        // Listen for style changes (when theme toggles)
        map.on('style.load', addStations);
        
        // Add stations on initial load
        if (map.isStyleLoaded()) {
            addStations();
        } else {
            map.once('load', addStations);
        }
        
        return () => {
            map.off('style.load', addStations);
        };
        
    }, [stationsData , darkMode]);

	return (
		<>
			<div ref={containerRef} style={{ position: 'absolute', width: '100vw', height: '99.5vh'}}> </div>
            <CustomAudioPlayer toggleTheme={ toggleTheme } darkMode={ darkMode } mapRef={ mapRef.current } />
		</>
	);
}

