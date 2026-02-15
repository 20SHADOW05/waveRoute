import { useState, useRef, useEffect } from 'react';
import { CustomAPtop , GenreCarousel , StationInfo , MiniAudio , Controls } from './otherUi';
import './AudioPlayer.css'

function CustomAudioPlayer({ toggleTheme , darkMode , mapRef }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentStation, setCurrentStation] = useState({
        name: '',
        country: '',
        state: '',
        streamUrl: ''
    });
    

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.preload = "none";
        audioRef.current.volume = volume;

        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(err => console.error("Playback failed:", err));
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    useEffect(() => {
        if (!mapRef) return;

        const map = mapRef;

        const handleStationClick = (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const { streamUrl, name } = feature.properties;
            if (!streamUrl) return;

            setErrorMessage(''); // Clear error
            setCurrentStation(feature.properties);

            const audio = audioRef.current;
            const currentStream = audio.dataset.currentStream;

            // Always try to play if it's the same broken station OR new station
            if (currentStream !== streamUrl || !isPlaying) {
                audio.pause();
                audio.src = streamUrl;
                audio.dataset.currentStream = streamUrl;
                audio.play().catch(err => {
                    console.error("Playback failed:", err);
                    setErrorMessage(`Cannot play "${name}" - Stream unavailable`);
                    setIsPlaying(false);
                    
                    setTimeout(() => setErrorMessage(''), 3000);
                });
                setIsPlaying(true);
            } else {
                // Only toggle if same station AND currently playing
                togglePlayPause();
            }
        };

        map.on('click', 'station-points', handleStationClick);

        return () => {
            map.off('click', 'station-points', handleStationClick);
        };
    }, [mapRef]);

    return (
        <>
            <div className={`audio-player ${isExpanded ? '' : 'minimized'}`}>
                <CustomAPtop isExpanded={ isExpanded } setIsExpanded={ setIsExpanded } toggleTheme={ toggleTheme } darkMode={ darkMode } />

                <GenreCarousel isExpanded={ isExpanded } />
                    
                <StationInfo isExpanded={ isExpanded } currentStation={ currentStation } />

                <Controls isExpanded={ isExpanded } togglePlayPause={ togglePlayPause } isPlaying={ isPlaying } volume={ volume } isMuted={ isMuted } handleVolumeChange={ handleVolumeChange } />

                <MiniAudio isExpanded={ isExpanded } currentStation={ currentStation } togglePlayPause={ togglePlayPause } isPlaying={ isPlaying } setIsExpanded={ setIsExpanded } />
            </div>
            {errorMessage && (
                <div className="error-toast">
                    {errorMessage}
                </div>
            )}
        </>
    )
}

export { CustomAudioPlayer };