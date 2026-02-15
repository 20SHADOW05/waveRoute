import { useState, useRef, useEffect } from 'react';
import { FiPlay , FiPause , FiMaximize2 , FiVolumeX , FiVolume2 } from "react-icons/fi";
import { CustomAPtop , GenreCarousel , StationInfo } from './otherUi';
import './AudioPlayer.css'

function CustomAudioPlayer({ currentStation  , toggleTheme , darkMode }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    

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

    const toggleMute = () => {
        const audio = audioRef.current;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
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

    if (isExpanded) {
        return (
            <div className="audio-player expanded z">
                <CustomAPtop setIsExpanded={ setIsExpanded } toggleTheme={ toggleTheme } darkMode={ darkMode } />

                <GenreCarousel />
                
                <StationInfo currentStation={ currentStation } />

                {/* Control Buttons */}
                <div className="controls z">
                    <div onClick={togglePlayPause} className="control-btn">
                        {isPlaying ? <FiPause className='icons-mini'/> : <FiPlay className='icons-mini'/>}
                    </div>

                    <div className="control-btn">
                        <div style={{ display: 'flex' }} onClick={toggleMute}>
                            {isMuted ? <FiVolumeX className='icons-mini'/> : <FiVolume2 className='icons-mini'/>}
                        </div>
                        <div className="volume-slider">
                            <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="slider" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Minimized Player
    return (
        <div className="audio-player minimized z">
            <StationInfo currentStation={ currentStation } displayState={ false }/>

            <div className="inside-mini">
                <div onClick={togglePlayPause} className="control-btn-mini">
                    {isPlaying ? <FiPause className="icons-mini" /> : <FiPlay className="icons-mini" />}
                </div>

                <div onClick={() => setIsExpanded(true)} className="control-btn-mini">
                    <FiMaximize2 className="icons-mini" />
                </div>
            </div>
        </div>
    );
}

// useEffect(() => {
//         if (!mapRef.current) return;

//         const map = mapRef.current;

//         const handleStationClick = (e) => {
//             console.log(e);
//             const feature = e.features?.[0];
//             if (!feature) return;

//             const { streamUrl, name } = feature.properties;
//             if (!streamUrl) return;

//             const audio = audioRef.current;

//             audio.pause();
//             let currentStream = audio.dataset.currentStream;
//             if (audio.dataset.currentStream !== streamUrl) {
//                 audio.src = streamUrl;
//                 audio.dataset.currentStream = streamUrl;
//             }

//             if(currentStream != audio.dataset.currentStream) {
//                 audio.play().catch(err => {
//                     console.error("Playback failed:", err);
//                 });
//             } 

//             console.log("Now playing:", name);
//         };

//         map.on('click', 'station-points', handleStationClick);

//         return () => {
//             map.off('click', 'station-points', handleStationClick);
//         };
//     }, []);

export { CustomAudioPlayer };