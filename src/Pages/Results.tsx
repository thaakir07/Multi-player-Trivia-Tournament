import { useState, useEffect, useRef } from 'react';
import './Results.css';
import backgroundImage from '../assets/resultsBackground.jpeg';
import firstPlaceImage from '../assets/firstPlace.png';
import secondPlaceImage from '../assets/secondPlace.png';
import thirdPlaceImage from '../assets/thirdPlace.png';
import clickSound from '../assets/dragon_ball_z_tele.mp3';
import { useNavigate, useLocation } from "react-router-dom";

interface Player {
  userId?: number;
  username: string;
  score: number;
}

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log("=== RESULTS PAGE DEBUG ===");
    console.log("Location state:", location.state);
    
    // Get results from navigation state
    if (location.state && location.state.finalScores) {
      const scores = location.state.finalScores;
      console.log("Final scores from state:", scores);
      console.log("Number of players:", scores.length);
      
      const transformedScores = scores.map((player: any) => ({
        userId: player.userId,
        username: player.username,
        score: player.score
      }));
      
      console.log("Transformed scores:", transformedScores);
      
      // Sort players by score (highest first)
      const sortedPlayers = [...transformedScores]
        .sort((a, b) => b.score - a.score);
      
      console.log("Sorted players:", sortedPlayers);
      setTopPlayers(sortedPlayers);
    } else {
      console.warn("No match results found in navigation state");
      setTopPlayers([]);
    }
  }, [location.state]);

  const handleReturnToProfile = () => {
    // Play click sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error("Error playing sound:", err);
      });
    }
    
    console.log("Returning to profile...");
    navigate("/profile");
  };

  // Determine how many players we have
  const numPlayers = topPlayers.length;

  return (
    <div className="results-container" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Hidden audio element for click sound */}
      <audio ref={audioRef} src={clickSound} preload="auto" />
      
      {/* Return to Profile Button */}
      <button
        onClick={handleReturnToProfile}
        className="return-button"
      >
        Return to Profile
      </button>

      {/* Content Container */}
      <div className="results-content">
        
        {/* Winner Title */}
        <div className="winner-title">
          <h1 className="winner-text">WINNER WINNER</h1>
          <h2 className="chicken-dinner-text">CHICKEN DINNER</h2>
        </div>

        {/* Show message if no players */}
        {numPlayers === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontSize: '2rem', 
            marginTop: '50px' 
          }}>
            No match results available
          </div>
        ) : (
          <div className="podium-container">
            
            {/* 2nd Place - Only show if there are 2+ players */}
            {numPlayers >= 2 && (
              <div className="podium-item">
                <div className="podium-image-wrapper">
                  <div className="player-info-container">
                    <h3 className="player-name">{topPlayers[1].username}</h3>
                    <p className="player-score second-score">{topPlayers[1].score}</p>
                  </div>
                  <img 
                    src={secondPlaceImage} 
                    alt="Second Place Podium" 
                    className="podium-image"
                  />
                </div>
              </div>
            )}

            {/* 1st Place - Always show if there's at least 1 player */}
            {numPlayers >= 1 && (
              <div className="podium-item">
                <div className="podium-image-wrapper">
                  <div className="player-info-container first-place-info">
                    <h3 className="player-name first-name">{topPlayers[0].username}</h3>
                    <p className="player-score first-score">{topPlayers[0].score}</p>
                  </div>
                  <img 
                    src={firstPlaceImage} 
                    alt="First Place Podium" 
                    className="podium-image first-place-image"
                  />
                </div>
              </div>
            )}

            {/* 3rd Place - Only show if there are 3+ players */}
            {numPlayers >= 3 && (
              <div className="podium-item">
                <div className="podium-image-wrapper">
                  <div className="player-info-container">
                    <h3 className="player-name">{topPlayers[2].username}</h3>
                    <p className="player-score third-score">{topPlayers[2].score}</p>
                  </div>
                  <img 
                    src={thirdPlaceImage} 
                    alt="Third Place Podium" 
                    className="podium-image"
                  />
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;