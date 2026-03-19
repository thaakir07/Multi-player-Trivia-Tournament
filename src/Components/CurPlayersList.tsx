

import { useNavigate } from "react-router-dom";
import "./CurPlayersList.css";
import { useEffect, useState } from "react";

interface CurPlayersListProps {
  matchId: string
}

export interface Player {
  playerStatus: "WAITING" | "READY" | "HOST";
  player_id: number;
  username: string;
  avatar_url: string;
}

function CurPlayersList({matchId}: CurPlayersListProps) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [stati, setStati] = useState<String[]>([]);
  const playerIcons = [
    "../src/assets/sp1.svg",
    "../src/assets/sp2.svg",
    "../src/assets/sp3.svg",
    "../src/assets/sp4.svg",
    "../src/assets/sp5.svg",
    "../src/assets/sp6.svg",
  ]

  const fetchPlayers = async () => {
      if (!matchId) {
        alert("No match ID provided");
        return;
      }

    try {
      const port = window.location.port;
      let token = localStorage.getItem(`currentToken_${port}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      if (!token) {
        alert("No authentication token found");
        navigate("/");
        return;
      }

      const response = await fetch(`/api/getPlayers/${matchId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      console.log(response);

      if (response.status === 401 && false) {
        navigate("/");
        localStorage.removeItem(`currentToken_${port}`);
        return;
      }

      const data:any[] = await response.json();
      const p:Player[] = [];
      const s:String[] = [];
      data.forEach((d:any) => {
        p.push(d.user),
        s.push(d.playerStatus)
        });

      setPlayers(p);
      setStati(s);

      if (!response.ok) {
        alert('Failed to fetch players!');
      }
    } catch (e) {
        console.error("Error fetching players: ", e);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2500);
    return () => clearInterval(interval);
  }, [matchId]);

  return (
    <div className="cur-players-list-container">
      <h1>Current Players</h1>
      <ul className="cur-players-list">
        {players.map((player, index) => {
          const status = stati[index];
          const statusClass = status === "HOST" ? "host" : status === "READY" ? "ready" : "not-ready";

            return(
            <li key={index}>
              <span className="name-span">{<img src={playerIcons[index]} alt="" className="player-icon"/>} {player.username}</span>
              <span className={`status-span-${statusClass}`}>{status}</span>
            </li>
        )})}
      </ul>
    </div>
  )
}

export default CurPlayersList;