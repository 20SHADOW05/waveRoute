import { useEffect , useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CustomAudioPlayer } from './audioPlayer.jsx';

export default function Map() {
    const [darkMode, setDarkMode] = useState(true);
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	let [stationsData , setStationsData] = useState(null);
    const selectedRef = useRef(null);
    const [selectedGenre, setSelectedGenre] = useState('All');

    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle("dark");
        setDarkMode(!darkMode);
    }

	useEffect(() => {
		const getStationsData = async () => {
			try {
				const stationsDataPromise = await fetch('http://localhost:3000/getStations');
				let Data = await stationsDataPromise.json(); // this method is used to read and parse a http response (JSON.parse is only for json string)
				console.log(Data.data.features.length , "didn't implement clustering because i want it to be visually dense");
				setStationsData(Data);
			} catch(error) {
				console.log(error);
			}
		}

		getStationsData();
	} , [])

    useEffect(() => {
        const isMobile = window.innerWidth < 768;

        mapRef.current = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            zoom: isMobile ? 1.5 : 0,
            renderWorldCopies: false,
            attributionControl: false,
            pitchWithRotate: false,
            dragRotate: false
        });

        mapRef.current.touchZoomRotate.disableRotation();
        mapRef.current.dragRotate.disable();
        mapRef.current.keyboard.disableRotation();

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
        if (!mapRef.current || !stationsData?.data?.features?.length) return;
        
        const map = mapRef.current;
        
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        }).setMaxWidth("300px");

        let currentFeatureCoordinates = undefined;

        const handleMouseMove = (e) => { // thanks to mapLibre docs for this hover popup
            const featureCoordinates = e.features[0].geometry.coordinates.toString();
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const { name, country } = e.features[0].properties;
                
                // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed 
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Populate the popup and set its coordinates based on the feature found.
                popup.setLngLat(coordinates).setHTML(`${name} 
                    <div class="cName">${country || ''}</div>`).addTo(map);
            }
        };

        const handleMouseLeave = () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        };
        
        const addStations = () => {
            if (map.getSource('stations')) {
                if (map.getLayer('station-aura')) map.removeLayer('station-aura');
                if (map.getLayer('station-points')) map.removeLayer('station-points');
                map.removeSource('stations');
            }

            map.addSource('stations', {
                type: 'geojson',
                data: stationsData.data,
                promoteId: 'id'
            });

            map.addLayer({
                id: 'station-aura',
                type: 'circle',
                source: 'stations',
                paint: {
                    'circle-radius': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        14,
                        0
                    ],
                    'circle-color': '#db3c3c',
                    'circle-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0.25,
                        0
                    ]
                }
            });

            map.addLayer({
                id: 'station-points',
                type: 'circle',
                source: 'stations',
                paint: {
                    'circle-radius': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        6.4,
                        3.2
                    ],
                    'circle-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#db3c3c',
                        darkMode ? 'rgb(210,210,210)' : 'rgb(80,80,80)'
                    ],
                    'circle-stroke-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0,
                        1
                    ],
                    'circle-stroke-color': darkMode ? '#000000' : '#ffffff'
                }
            });

            if (selectedRef.current !== null) {
                map.setFeatureState(
                    { source: 'stations', id: selectedRef.current },
                    { selected: true }
                );
            }

            if (selectedGenre !== 'All') {
                const filter = ['in', selectedGenre.toLowerCase(), ['get', 'tags']];
                map.setFilter('station-points', filter);
                map.setFilter('station-aura', filter);
            }
        };

        const handleStationClick = (e) => {
            const id = e.features[0].properties.id;

            if (selectedRef.current !== null) {
                map.setFeatureState(
                    { source: 'stations', id: selectedRef.current },
                    { selected: false }
                );
            }

            map.setFeatureState(
                { source: 'stations', id },
                { selected: true }
            );

            selectedRef.current = id;
        };

        map.on('style.load', addStations);
        
        if (map.isStyleLoaded()) {
            addStations();
        } else {
            map.once('load', addStations);
        }
        
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        if (!isMobile) {
            map.on('mousemove', 'station-points', handleMouseMove);
            map.on('mouseleave', 'station-points', handleMouseLeave);
        }
        map.on('click', 'station-points', handleStationClick);

        return () => {
            map.off('style.load', addStations);
            map.off('mousemove', 'station-points', handleMouseMove);
            map.off('mouseleave', 'station-points', handleMouseLeave);
            map.off('click', 'station-points', handleStationClick);
        };
        
    }, [stationsData ,  darkMode]);

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        if (!map.getLayer('station-points')) return;

        if (selectedGenre === 'All') {
            map.setFilter('station-points', null);
            map.setFilter('station-aura', null);
        } else {
            const filter = ['in', selectedGenre.toLowerCase(), ['get', 'tags']];

            map.setFilter('station-points', filter);
            map.setFilter('station-aura', filter);
        }

    }, [selectedGenre]);

	return (
		<>
			<div ref={containerRef} style={{ position: 'absolute', width: '100vw', height: '100vh'}}> </div>
            <CustomAudioPlayer toggleTheme={ toggleTheme } darkMode={ darkMode } mapRef={ mapRef.current } selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}/>
		</>
	);
}

