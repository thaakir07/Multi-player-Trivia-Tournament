import { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

type state = {
    isHost: boolean,
    username: string,
    categories?: string[],
    difficulty?: string,
    numQuestions?: number
    matchId?: number
}

function NavBar() {
    const navigate = useNavigate();
    const [location, setLocation] = useState(window.location.pathname);
    const [showJoinLobby, setShowJoinLobby] = useState(false);

    function handleNavigate(path: string, state?: state) {
        navigate(path);
        setLocation(path);
        setShowJoinLobby(false);
    }

    const handleJoinLobbyClick = () => {
        setShowJoinLobby(!showJoinLobby);
    }

    return (
        <div className="navBarContainer">
            <nav className='navBar'>
                <button className='title' onClick={() => handleNavigate('/profile')}>Trivimax</button>
                <button onClick={() => handleNavigate('/profile')}>My Profile</button>
                <button onClick={() => handleNavigate('/createLobby')}>Matches</button>
                <button onClick={() => handleJoinLobbyClick()}>Join Lobby</button>
                <button onClick={() => handleNavigate('/')}>
                    {location === '/' ? 'Sign in' : 'Log out'}
                </button>
            </nav>
            {showJoinLobby && <JoinLobby onClose={() => setShowJoinLobby(false)} handleNavigate={handleNavigate} />}
        </div>

    )
}





interface JoinLobbyProps {
    onClose: () => void
    handleNavigate: { (path: string, state?: state): void; }
}

function JoinLobby({ onClose, handleNavigate }: JoinLobbyProps) {
    const [lobbyCode, setLobbyCode] = useState<number>(0);

    async function handleJoin() {
    console.log(`Joining lobby with code: ${lobbyCode}`);
    const portNumber = window.location.port;
    const userStr = localStorage.getItem(`user_${portNumber}`);
        if (!userStr) return;
            const player = JSON.parse(userStr);
            try {
                await joinMatch(lobbyCode, player.player_id);
                onClose();
                handleNavigate(`/waitingLobby/${lobbyCode}`, {
                    isHost: false,
                    username: player.username
                });
            } catch (err: any) {
                console.error(err.message);
                alert("Failed to join lobby: " + err.message);
        }
    }



    return (
        <div className="overlay">
        <div className="joinLobbyCard">
            <h2>Join a Lobby</h2>
            <input type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(parseInt(e.target.value))}
            placeholder="Enter Lobby Code" />
            <div className="joinButtons">
            <button onClick={handleJoin}>Join</button>
            <button className="closeButton" onClick={onClose}>
                Close
            </button>
            </div>
        </div>
        </div>
    );
}

async function joinMatch(lobbyCode: number, playerId: number) {
    const portNumber = window.location.port;
    // const navigate = useNavigate();
    const port = window.location.port;
    let token = localStorage.getItem(`currentToken_${port}`);
    if (token) {
        token = token.replace(/^"|"$/g, "");
    }
    console.log("Token found:", token ? "Yes" : "No");
    console.log(token);
    console.log(lobbyCode, playerId);
    const res = await fetch("/api/joinMatch", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            matchId: lobbyCode,
            userId: playerId
        })
    });
    if (res.status === 401) {
        // navigate("/");
        localStorage.removeItem(`currentToken_${portNumber}`);
        return;
    }

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to join match");
    }

    return res.json();
}


export default NavBar;