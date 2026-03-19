import "./MatchInviteCard.css";

interface MatchCardProps {
  matchId: number;
  players: any[];
}

function MatchInviteCard({ matchId, players }: MatchCardProps) {
  return (
    <div className="match-card">
      <div className="match-id-container">
        <label className="id-label">Match ID:</label>
        <label className="actual-id">{matchId}</label>
      </div>
      <div className="players-container">
        <label className="players-label">Players:</label>
        <label className="actual-players">{players.join(", ")}</label>
      </div>
      <div className="buttons-container">
        <button className="join-button">Join lobby</button>
        <button className="reject-button">Reject Invite</button>
      </div>
    </div>
  );
}

export default MatchInviteCard;