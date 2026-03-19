import "./MatchInfoBox.css";

interface matchInfoBoxProps {
  categories: string[];
  difficulty: string;
  numQuestions: number;
}

function MatchInfoBox({categories, difficulty, numQuestions}: matchInfoBoxProps) {
  return (
    <div className="match-info-box">
        <h1>Match Info</h1>
        <div className="arcade-machine-container">
          <div className="screen-content">
            <div className="scroll-text">
              <p>Welcome to the Arcade!</p>
              <p>Here are the match details:</p>
              <p>Categories: {categories.join(", ")}</p>
              <p>Difficulty: {difficulty}</p>
              <p># Questions: {numQuestions}</p>
            </div>
          </div>
        </div>
    </div>
  );
}

export default MatchInfoBox;