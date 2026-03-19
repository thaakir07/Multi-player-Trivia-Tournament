import { MdOutlineSortByAlpha } from "react-icons/md";
import { useEffect, useState } from "react";
import "./MatchHistory.css";

interface Match {
  id: number;
  userId: number;
  matchId: number;
  joinedAt: string;
  match: {
    id: number;
    hostId: number;
    difficulty: string;
    status: string;
    createdAt: string;
    numQuestions: number;
    result: any;
    categories: { category: { name: string } }[];
    players: any[];
  };
}

function MatchHistory() {
  const portNumber = window.location.port;
  const userData = localStorage.getItem(`user_${portNumber}`);
  const u = userData ? JSON.parse(userData) : null;

  const [myMatchHistory, setMyMatchHistory] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortedAsc, setIsSortedAsc] = useState(false); // toggle sort direction

  useEffect(() => {
    async function getHistory() {
      if (!u) return;

      try {
        const res = await fetch("/api/getHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: u.player_id }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Server error:", data.error);
          alert("Error: " + data.error);
          return;
        }

        setMyMatchHistory(data);
      } catch (err) {
        console.error("Network error:", err);
      }
    }

    getHistory();
  }, [u]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const sortMatches = () => {
    setMyMatchHistory((prev) => {
      const sorted = [...prev].sort((a, b) =>
        isSortedAsc ? a.match.id - b.match.id : b.match.id - a.match.id
      );
      return sorted;
    });
    setIsSortedAsc(!isSortedAsc);
  };

  const filteredMatches = myMatchHistory.filter(
    (entry) =>
      entry.match.categories
        .map((c) => c.category.name.toLowerCase())
        .join(", ")
        .includes(searchQuery.toLowerCase()) ||
      entry.match.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.match.id.toString().includes(searchQuery)
  );

  return (
    <div className="match-history-card">
      <div id="mh-header">
        <button id="sort-button" onClick={sortMatches}>
          <MdOutlineSortByAlpha id="sort-icon" />
        </button>
        <h1 className="match-history-title">Match History:</h1>
        <input
          type="text"
          placeholder="Search Matches..."
          id="search-bar"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <ul className="match-history-list">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((entry) => (
            <li key={entry.id} className="match-history-item">
              <div className="match-title">
                <strong>Match #{entry.match.id}</strong> — {entry.match.status}
              </div>

              <div className="match-details-box">
                <div className="match-categories">
                  Categories:{" "}
                  {entry.match.categories.map((c) => c.category.name).join(", ")}
                </div>
                <div className="match-diff">
                  <span className="diff-label">Difficulty:</span>
                  <span className="diff-value">{entry.match.difficulty}</span>
                </div>
                <div className="num-label">
                  <span className="num-label-title">Questions:</span>
                  <span className="num-value">{entry.match.numQuestions}</span>
                </div>
                <div className="num-label">
                  <span className="num-label-title">Players:</span>
                  <span className="num-value">{entry.match.players.length}</span>
                </div>
              </div>

              <div className="match-time-box">
                <div className="date-label">
                  Joined At: {new Date(entry.joinedAt).toLocaleString()}
                </div>
                <div className="date-label">
                  Created At: {new Date(entry.match.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="match-history-item no-data">
            No matches found {searchQuery && `for "${searchQuery}"`}
          </li>
        )}
      </ul>
    </div>
  );
}

export default MatchHistory;
