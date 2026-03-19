import "./History.css";

interface QuestionHistory {
  question: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

interface HistoryProps {
  rounds: string[];
  questionHistory: QuestionHistory[];
  questionsPerRound: number;
  currentQuestionIndex: number;
}

function History({
  rounds,
  questionHistory,
  questionsPerRound,
  currentQuestionIndex,
}: HistoryProps) {
  const answeredQuestions = questionHistory.slice(0, currentQuestionIndex + 1);

  return (
    <div className="history-card">
      <h1 className="history-title">Match History:</h1>
      <ul className="history-list">
        {rounds.map((round, roundIndex) => {
          const startIndex = roundIndex * questionsPerRound;
          const endIndex = Math.min(
            startIndex + questionsPerRound,
            answeredQuestions.length
          );

          const roundQuestions = answeredQuestions.slice(startIndex, endIndex);
          if (roundQuestions.length === 0) return null;

          return (
            <li key={roundIndex}>
              <details
                className="history-dropdown-menu"
                open={
                  roundIndex ===
                  Math.floor((currentQuestionIndex - 1) / questionsPerRound)
                }
              >
                <summary className="history-dropdown-button">
                  <span className="round-name">
                    {round} ({roundQuestions.length}/{questionsPerRound})
                  </span>
                </summary>

                <ul className="history-questions-list">
                  {roundQuestions.map((questionItem, qIndex) => {
                    const questionNumber = startIndex + qIndex + 1;
                    const answerClass = questionItem.isCorrect
                      ? "correct-answer"
                      : "incorrect-answer";

                    return (
                      <li key={qIndex}>
                        <div className="history-question-item">
                          <div className="history-answer-info">
                            <span className="question-number">
                              Question {questionNumber}:
                            </span>
                            <span className={`history-answer ${answerClass}`}>
                              {questionItem.selectedAnswer || "Not answered"}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default History;
