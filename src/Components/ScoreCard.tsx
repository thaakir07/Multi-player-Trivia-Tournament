import "./ScoreCard.css";

interface PlayerScore {
  name: string;
  score: number;
}

interface PlayerStatus {
  answered: string[];
  waiting: string[];
}

interface ScoreCardProps {
  matchName: string;
  playerScores: PlayerScore[]; // list of players and their scores
  playerStatus: PlayerStatus; // answered and waiting players
}

function ScoreCard({ matchName, playerScores, playerStatus }: ScoreCardProps) {
  console.log("playerScores", playerScores);
  return (
    <div className="score-card">
      <h1 className="score-title">Match: {matchName}</h1>

      <h2 className="scoreboard-title">Current Scores:</h2>
      <ul className="scoreboard-list">
        {playerScores.map((player, index) => (
          <li key={index} className="scoreboard-item">
            <span className="player-name">{player.name}</span>
            <span className="player-score">{player.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScoreCard;
