import { useEffect , useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const markersRef = useRef([]);
	let [stationsData , setStationsData] = useState(null)


	useEffect(() => {

		const getStationsData = async () => {
			try {
				const stationsDataPromise = await fetch('http://localhost:3000/initialStations'); // fetch returns a promise
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
		
		// Clear existing markers
		markersRef.current.forEach(marker => marker.remove());
		markersRef.current = [];
		
		stationsData.forEach((station) => {
			const marker = new maplibregl.Marker()
				.setLngLat([parseFloat(station.geo_long), parseFloat(station.geo_lat)])
				.setPopup(new maplibregl.Popup().setHTML(`<strong>${station.name}</strong>`))
				.addTo(mapRef.current);
			
			markersRef.current.push(marker);
		});
		
		console.log(`Added ${markersRef.current.length} markers to map`);
	}, [stationsData])

	return (
		<>
			<div ref={containerRef} style={{ width: '100vw', height: '99.5vh'}}> </div>	
		</>
	);
}

