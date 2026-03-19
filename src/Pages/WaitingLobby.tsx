import CurPlayersList from "../Components/CurPlayersList";
import MatchInfoBox from "../Components/MatchInfoBox";
import { useNavigate, useLocation, useParams  } from "react-router-dom";
import "./WaitingLobby.css";
import { useEffect, useState } from "react";
import { useSocket } from "../Context/SocketContext";
import { startLoading, stopLoading } from "../Components/LoadingScreen";

interface Player {
  userId: number;
  username: string;
  avatar: string;
  status: string;
  score: number;
  joinedAt: string;
}

interface Match {
  id: number;
  hostId: string;
  difficulty: string;
  numQuestions: number;
  status: string;
  categories: Array<{
    category: {
      id: number;
      name: string;
    };
  }>;
  players: Player[];
  isHost: boolean;
  playerCount: number;
}


function WaitingLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId } = useParams<{ matchId: string }>();
  
  // States for match data
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const { socket, isConnected } = useSocket();
  const [fetched, setFetch] = useState(false);
  const [ready, setReady] = useState(false);

  // States passed from previous page
  const state = location.state as {
    isHost: boolean,
    username: string
    categories: string[],
    difficulty: string,
    numQuestions: number,
  } | undefined;

  // Fallback in case state is undefined
  const {
    isHost = false,
    categories = [],
    difficulty = "",
    numQuestions = 0,
  } = state || {};

   const fetchMatchData = async () => {
    if (!matchId) {
      setError("No match ID provided");
      setLoading(false);
      return;
    }

    try {
      const port = window.location.port;
      let token = localStorage.getItem(`currentToken_${port}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      if (!token) {
        setError("No authentication token found");
        navigate("/");
        return;
      }

      const response = await fetch(`/api/getMatch/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ matchId: parseInt(matchId) })
      });
      if (response.status === 401) {
            navigate("/");
            localStorage.removeItem(`currentToken_${port}`);
            return;
        }

      const data = await response.json();

      if (response.ok) {
        setMatch(data.match);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch match data");
      }
      setFetch(true);
    } catch (err) {
      console.error("Error fetching match:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch match data on component mount
  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  useEffect(() => {
  if (!socket || !matchId) return;

  const port = window.location.port;
  const user = localStorage.getItem(`user_${port}`);
  const userId = user ? JSON.parse(user).player_id : null;

  if (userId) {
    socket.emit("join_match", { matchId: parseInt(matchId), userId });
    console.log(`Joined socket room match_${matchId}`);
  }
}, [socket, matchId]);

  // Refresh match data every 3 seconds to show live updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (matchId && !loading) {
        fetchMatchData();
      }
  }, 3000);

    return () => clearInterval(interval);
  }, [matchId, loading]);

  async function startMatch() {
    if (!match || !matchId) {
          alert("No match data available");
          return;
        }

        try {
          startLoading();
          const port = window.location.port;
          let token = localStorage.getItem(`currentToken_${port}`);
          if (token) {
            token = token.replace(/^"|"$/g, "");
          }
          if (isHost) {
            const hostPlayer = match.players.find(p => p.userId.toString() === match.hostId);
            if (hostPlayer && hostPlayer.status === "WAITING") {
              // Auto-ready the host first
              const response = await fetch("/api/setReady", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ matchId: parseInt(matchId) })
              });
              if (response.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${port}`);
                return;
            }
            }
          }
          const response = await fetch("/api/startMatch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ matchId: parseInt(matchId) })
          });
          if (response.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${port}`);
                return;
            }

          const data = await response.json();

          if (response.ok) {
            setTimeout(() => {
              socket?.emit("start_game", { matchId: parseInt(matchId||"") });
            }, 300);

            // Navigate to the actual match/game page with match ID
            navigate(`/matchPage/match/${matchId}` , { state: { categories: state?.categories } });
          } else {
            alert("Error starting match: " + data.error);
          }
          stopLoading();
        } catch (err) {
          console.error("Error starting match:", err);
          alert("Failed to start match");
        }
  }

  async function readyUp() {
    if (!matchId) {
      alert("No match ID available");
      return;
    }

    try {
      const port = window.location.port;
      let token = localStorage.getItem(`currentToken_${port}`);
      let user = localStorage.getItem(`user_${port}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      }

      const response = await fetch("/api/setReady", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ matchId: parseInt(matchId) })
      });
      if (response.status === 401) {
          navigate("/");
          localStorage.removeItem(`currentToken_${port}`);
          return;
      }

      const data = await response.json();

      if (response.ok) {
        // Refresh match data to show updated status
        fetchMatchData();

      } else {
        alert("Error setting ready status: " + data.error);
      }
      setReady(true);
    } catch (err) {
      console.error("Error setting ready:", err);
      alert("Failed to set ready status");
    }
  }

  async function cancelMatch() {
    if (!matchId) {
          alert("No match ID available");
          navigate('/createLobby')
          return;
    }
    try {
        startLoading();
        const port = window.location.port;
        let token = localStorage.getItem(`currentToken_${port}`);
        if (token) {
          token = token.replace(/^"|"$/g, "");
        }
          const response = await fetch("/api/deleteMatch/${matchId}", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ matchId: parseInt(matchId) })
          });
          if (response.status === 401) {
                navigate("/");
                localStorage.removeItem(`currentToken_${port}`);
                return;
            }
          const data = await response.json();
          if (response.ok) {
            alert("Match Cancelled sussfully");
            navigate('/createLobby');
          } else {
            alert("Error cancelling match: " + data.error);
            navigate('/createLobby');
          }
          stopLoading();
    } catch (e) {
      console.error("Error cancelling match:", e);
      alert("Failed to cancell match");
      navigate('/createLobby');
    }
  }

  async function leaveMatch() {
    if (!matchId) {
      navigate('profile/');
      return;
    }
    try {
      startLoading();
      const port = window.location.port;
      let token = localStorage.getItem(`currentToken_${port}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      } 
        const response = await fetch("/api/LeaveMatch/${matchId}", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ matchId: parseInt(matchId) })
        });
        if (response.status === 401) {
          navigate("/");
          localStorage.removeItem(`currentToken_${port}`);
          return;
        }
        const data = await response.json();
        if (response.ok) {
          alert("Successfully left match");
          navigate('/profile');
        } else {
          alert("error leaving match: " + data.error);
        }
        stopLoading();
    } catch (e) {
      console.error("Error leaving match: ", e);
      alert("Failed to leave");
    }
  }

useEffect(() => {
  if (!socket || isHost) return;
  const handleGameStarted = () => {
    navigate(`/matchPage/match/${matchId}`);
  };

  socket.on("game_started", handleGameStarted);

  return () => {
    socket.off("game_started", handleGameStarted);
  };
}, [socket, isHost, matchId, navigate]);

  return (
    <div className="waiting-lobby">

      <div className="players-list-container">
        <div className="invite-box">
          <label>Invite Player: </label>
          <input type="text" placeholder="Username"/>
        </div>
        <CurPlayersList
          matchId={matchId||""}
        />
      </div>

      <div className="start-match-container">
        <h1>Press Start</h1>
        <div className="buttons-container">
          {isHost ?
            <button className="start-button" disabled={!fetched} onClick={startMatch}>{fetched ? "Start" : "Fetching..."}</button> :
            <button className="start-button" disabled={ready} onClick={readyUp}>{ready ? "I'm ready!" : "Ready Up"}</button>}
          {isHost ?
            <button className="cancel-button" onClick={cancelMatch}>Cancel</button> :
            <button className="cancel-button" onClick={leaveMatch}>Leave Match</button>}
        </div>
      </div>

      <div className="match-info-container">
        <MatchInfoBox categories={categories} difficulty={difficulty} numQuestions={numQuestions}/>
      </div>

    </div>
  );
}

export default WaitingLobby;