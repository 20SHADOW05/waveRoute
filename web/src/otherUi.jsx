import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { LuHand , LuMail } from "react-icons/lu";
import { MdDarkMode , MdLightMode } from "react-icons/md";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FiHeadphones , FiRadio , FiZap , FiWind , FiFeather , FiDisc , FiActivity , FiSun } from "react-icons/fi";
import { FiMinimize2 } from "react-icons/fi";

function Theme({ toggleTheme ,  mode }) {
    return (
        <div onClick={ toggleTheme } className="z theme-in">
            {
                { mode } == true ? <MdDarkMode className="icons"/> : <MdLightMode className="icons"/>
            }
        </div>
    );
}

function Links() {
    return (
        <div className="z links">
            <a href="http://"> <FaLinkedin className="icons"/> </a>
            <a href="mailto:"> <LuMail className="icons"/> </a>
        </div>
    );
}

function HiFive() {
    const [hiFiveCount , setHighFiveCount ] = useState(0);

    const handleClick = () => {
        setHighFiveCount((count) => count + 1);
    }

    return (
        <div className="z hi5" onClick={ handleClick } >
            <LuHand className="icons"/>
            <div style={{ maxwidth: '120px' , fontFamily: 'noto' , color: 'var(--icon-color)' }}> { hiFiveCount } </div>
        </div>
    );
}

function CustomAPtop({ setIsExpanded , toggleTheme , darkMode }) {
    
    return (
        <>
            <div className='overall-top'>
                <Links />
                <div className='t-h'>
                    <HiFive />
                    <Theme toggleTheme={ toggleTheme } mode={ darkMode } />
                    <div style={{ display: 'flex' }} onClick={() => setIsExpanded(false)} >
                        <FiMinimize2 className="icons-mini theme-in" />
                    </div>
                </div>
            </div>
        </> 
    );
}

function GenreCarousel(){
    const [selectedGenre, setSelectedGenre] = useState('All');
    
    const GENRES = [
        { genre: 'All', icon: FiHeadphones },
        { genre: 'Pop', icon: FiRadio },
        { genre: 'Rock', icon: FiZap },
        { genre: 'Jazz', icon: FiWind },
        { genre: 'Classical', icon: FiFeather },
        { genre: 'Hip Hop', icon: FiDisc },
        { genre: 'Electronic', icon: FiActivity },
        { genre: 'Folk', icon: FiSun },
    ];
    const [genreStartIndex, setGenreStartIndex] = useState(0);
    const visibleGenres = 3;
    const slideAmount = 98;

    const scrollGenresLeft = () => {
        if (genreStartIndex > 0) {
            setGenreStartIndex(genreStartIndex - 1);
        }
    };

    const scrollGenresRight = () => {
        if (genreStartIndex < GENRES.length - visibleGenres) {
            setGenreStartIndex(genreStartIndex + 1);
        }
    };

    return (
        <div className="genre-selector">  {/* genre selector */}
             <button onClick={scrollGenresLeft} disabled={genreStartIndex === 0} className="genre-arrow">
                <FaChevronLeft />
            </button>
        
            <div className="genre-list">
                <div className="genre-list-inner"
                    style={{
                        transform: `translateX(-${genreStartIndex * slideAmount}px)`
                    }}>
                    {GENRES.map(({ genre, icon: Icon }) => (
                        <div key={genre} 
                            onClick={() => setSelectedGenre(genre)} 
                            className={`each-genre ${selectedGenre === genre ? 'active' : ''}`}
                        >
                            <Icon className="icons-mini" />
                            <div>{genre}</div>
                        </div>
                    ))}
                 </div>
            </div>
        
            <button onClick={scrollGenresRight} disabled={genreStartIndex >= GENRES.length - visibleGenres} className="genre-arrow">
                <FaChevronRight />
            </button>
        </div>
    )
}

function StationInfo({ currentStation , displayState = true }){
    
    if(currentStation.name == ''){
        return (
            <div style={{ padding: '6px' }}>
                Currently Not Playing Anything!
            </div>
        )
    }

    return (
        <div className="station-info">
            <div className="station-name">{currentStation?.name}</div>
            <div className="station-location">
                {currentStation.state == undefined || displayState == true ? `${currentStation.state}, ${currentStation.country}` : currentStation.country}
            </div>
        </div>
    )
}
 
export { CustomAPtop , GenreCarousel , StationInfo };