import { useState, useEffect } from "react";
import NavBar from "../Components/NavBar";
import ProfileCard from "../Components/ProfileCard";
import LeaderBoard from "../Components/LeaderBoard";
import MatchHistoryCard from "../Components/MatchHistory";
import "./Profile.css";

function Profile() {
  const portNumber = window.location.port;
  const userString = localStorage.getItem(`user_${portNumber}`);
  const token = localStorage.getItem(`currentToken_${portNumber}`);
  
  const u = userString ? JSON.parse(userString) : null;
  
  const [score, setScore] = useState(0);
  const [games, setGames] = useState(0);

  useEffect(() => {
    async function getScoreAndGames() {
      if (!u || !u.player_id) return;
      
      try {
        // Fetch score
        const scoreRes = await fetch(`/api/userScore/${u.username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token?.replace(/^"|"$/g, "")}`,
          },
        });
        
        if (!scoreRes.ok) throw new Error("Failed to fetch score");
        const scoreData = await scoreRes.json();
        setScore(scoreData);
        
        // Fetch match history and count them
        const historyRes = await fetch(`/api/getHistory`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token?.replace(/^"|"$/g, "")}`,
          },
          body: JSON.stringify({ userID: u.player_id })
        });
        
        if (!historyRes.ok) throw new Error("Failed to fetch match history");
        const historyData = await historyRes.json();
        console.log("Match history:", historyData);
        setGames(historyData.length);
        
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    
    getScoreAndGames();
  }, [u?.player_id, token]);

  return (
    <div>
      <NavBar />
      <div className="profile-page">
        <ProfileCard
          username={u?.username}
          profilePic={u?.avatar_url}
          gamesPlayed={games}
          highScore={score}
          curDate={u?.joinDate?.split("T")[0] ?? "N/A"}
        />
        <MatchHistoryCard/>
        <LeaderBoard />
      </div>
    </div>
  );
}

export default Profile;