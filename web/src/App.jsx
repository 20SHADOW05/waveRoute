import { useEffect , useRef } from 'react';
import maplibregl from 'maplibre-gl';


function Map() {
	const containerRef = useRef(null);
	const mapRef = useRef(null);

	useEffect(() => {

		mapRef.current = new maplibregl.Map({
			container: containerRef.current,
			style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
			zoom: 0,
			renderWorldCopies: false,
			attributionControl: false
		});



		return () => {  // don't question this clean up , its required. what if the component unmounts when toggled between 2d and 3d.
			mapRef.current.remove();
		};

  	} , []);

	return (
		<>
			<div ref={containerRef} style={{ width: '100vw', height: '99.5vh'}}> </div>	
		</>
	);
}

export default Map;
