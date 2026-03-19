import "./CurMatchesBox.css";
import { IoRefresh } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../Context/SocketContext';
import MatchInviteCard from "./MatchInviteCard";

interface Player {
  id: number;
  username: string;
  avatar_url: string;
  status: string;
  isReady: boolean;
}

interface Match {
  id: number;
  hostId: string;
  difficulty: string;
  numQuestions: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  isHost: boolean;
  playerCount: number;
  categories: string[];
  players: Player[];
}

function CurMatchesBox() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();


  const fetchCurrentMatches = async () => {
    try {

      setLoading(true);
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      } else {
        setError("Authentication required");
        return;
      }

      const response = await fetch("/api/getUserCurrentMatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.status === 401) {
        navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching current matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  // Leave a match
  const leaveMatch = async (matchId: number) => {
    try {
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      const response = await fetch("/api/leaveMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ matchId })
      });
      if (response.status === 401) {
        navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        // Refresh matches after leaving
        fetchCurrentMatches();
        alert("Left match successfully!");
      } else {
        alert("Error leaving match: " + data.error);
      }
    } catch (err) {
      console.error("Error leaving match:", err);
      alert("Failed to leave match");
    }
  };

  // Start a match (host only)
  const startMatch = async (matchId: number) => {
    try {
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      const response = await fetch("/api/startMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ matchId })
      });
      if (response.status === 401) {
        navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        alert("Match started successfully!");
        // Navigate to game/waiting lobby - adjust path as needed
        navigate(`/match/${matchId}`);
      } else {
        alert("Error starting match: " + data.error);
      }
    } catch (err) {
      console.error("Error starting match:", err);
      alert("Failed to start match");
    }
  };

  // Set player ready status
  const setReady = async (matchId: number) => {
    try {
      const portNumber = window.location.port;
      let token = localStorage.getItem(`currentToken_${portNumber}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      const response = await fetch("/api/setReady", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ matchId })
      });

      const data = await response.json();

      if (response.ok) {
        fetchCurrentMatches(); // Refresh to show updated status
      } else {
        alert("Error setting ready status: " + data.error);
      }
    } catch (err) {
      console.error("Error setting ready:", err);
      alert("Failed to set ready status");
    }
  };

  const numRows = async () => {
    return matches.length/2;
  };

  // Load matches on component mount
  useEffect(() => {
    fetchCurrentMatches();
     if (socket) {
      socket.on("match_created", (data: any) => {
        console.log("New match created:", data);
        fetchCurrentMatches(); // Refresh the list
      });

      socket.on("match_updated", (data: any) => {
        console.log("Match updated:", data);
        fetchCurrentMatches(); // Refresh the list
      });

      socket.on("player_joined_match", (data: any) => {
        console.log("Player joined a match:", data);
        fetchCurrentMatches(); // Refresh the list
      });

      socket.on("player_left_match", (data: any) => {
        console.log("Player left a match:", data);
        fetchCurrentMatches(); // Refresh the list
      });

      // Cleanup socket listeners
      return () => {
        socket.off("match_created");
        socket.off("match_updated");
        socket.off("player_joined_match");
        socket.off("player_left_match");
      };
    }
  }, [socket]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING": return "orange";
      case "IN_PROGRESS": return "green";
      case "COMPLETED": return "blue";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <div className="cur-matches-box">
        <h1>Current and Upcoming Matches</h1>
        <hr className="title-line"/>
        <div className="loading">Loading your matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cur-matches-box">
        <h1>Current and Upcoming Matches</h1>
        <hr className="title-line"/>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchCurrentMatches} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cur-matches-box">
      <div className="cur-matches-header">
        <label id="active-match-label">Active Match{matches.length !== 1 ? 'es' : ''} {matches.length}</label>
        <h1>Current and Upcoming Matches</h1>
        <button onClick={fetchCurrentMatches} className="refresh-button">
          <IoRefresh id="refresh-icon"/>
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <p>No current matches</p>
          <p>Create a new match to get started!</p>
        </div>
      ) : (
        <div className="match-cards-container">
        {matches.map((match) => (
          <MatchInviteCard
            key={match.id}
            matchId={match.id}
            players={match.players.map((player: any) => player.username)}
          />
        ))}
      </div>
      )}
    </div>
  );
}

export default CurMatchesBox;