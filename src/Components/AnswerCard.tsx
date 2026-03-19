import React, { useMemo } from 'react';
import './AnswerCard.css';

interface AnswerCardProps {
  answers: string[];
  onSelect: (index: number, answer: string) => void;
  selected: number | null;
  disabled?: boolean;
  show?: boolean;
  correctAnswer?: string;
  showResults?: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answers, 
  onSelect, 
  selected, 
  disabled = false,
  correctAnswer,
  showResults = false
}) => {

  const shuffledAnswers = useMemo(() => {
    const shuffled = [...answers].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [answers]);

  const handleAnswerClick = (index: number, answer: string) => {
    if (disabled || selected !== null) return;
    onSelect(index, answer);
  };

  const getButtonClass = (index: number, answer: string) => {
    let className = `answer-button answer-${index + 1}`;
    
    if (selected === index) {
      className += ' selected';
    }
    
    if (showResults && correctAnswer) {
      if (answer === correctAnswer) {
        className += ' correct';
      } else {
        className += ' incorrect';
      }
    }
    
    return className;
  };

  return (
    <div className="answer-card">
      <h3 className="answer-title">Choose your answer:</h3>
      
      <ul className="answer-list">
        {shuffledAnswers.map((answer, index) => (
          <li key={index}>
            <button
              className={getButtonClass(index, answer)}
              onClick={() => handleAnswerClick(index, answer)}
              disabled={disabled || selected !== null}
            >
              <span className="answer-label">
                {`${String.fromCharCode(65 + index)}. ${answer}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
      
      {disabled && (
        <p style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginTop: '10px',
          fontStyle: 'italic' 
        }}>
          {selected !== null ? 'Answer submitted!' : 'Time\'s up!'}
        </p>
      )}
    </div>
  );
};

export default AnswerCard;