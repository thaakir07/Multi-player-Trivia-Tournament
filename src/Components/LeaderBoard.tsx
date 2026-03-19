import { useState, useEffect } from "react";
import "./LeaderBoard.css";

interface PlayerScore {
  username: string;
  score: number;
}

function LeaderBoard() {
  const [playersAndScores, setPlayersAndScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const fetchPlayerScores = async () => {
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) token = token.replace(/^"|"$/g, "");

      if (!token) return;

      try {
        const res = await fetch("/api/userScores", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch scores");

        const data: PlayerScore[] = await res.json();
        data.sort((a, b) => b.score - a.score);
        setPlayersAndScores(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching scores:", err);
      }
    };

    fetchPlayerScores();
  }, []);

  return (
    <div className="leaderboard-card">
      <h1 className="leaderboard-title">Leaderboard:</h1>
      <div className="leaderboard-headers">
        <label className="rank-label">Rank</label>
        <label className="username-label">Username</label>
        <label className="score-label">Score</label>
      </div>
      <ul className="leaderboard-list">
        {playersAndScores.map((player, index) => (
          <li key={player.username}>
            <span className="rank-span">{index + 1}</span>
            <span className="username-span">{player.username}</span>
            <span className="score-span">{player.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeaderBoard;
