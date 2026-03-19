import type { ReactNode } from "react";
import "./GameLayout.css";

interface GameLayoutProps {
  timer: ReactNode;
  history: ReactNode;
  questionBox: ReactNode;
  answerCard: ReactNode;
  scoreCard: ReactNode;
}

function GameLayout({ timer, history, questionBox, answerCard, scoreCard }: GameLayoutProps) {
  return (
    <>
      {timer}
      <div className="game-layout">
        <div className="game-layout-history">
          {history}
        </div>
        <div className="game-layout-center">
          {questionBox}
          {answerCard}
        </div>
        <div className="game-layout-score">
          {scoreCard}
        </div>
      </div>
    </>
  );
}

export default GameLayout;