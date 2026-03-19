import { useEffect, useRef, useState } from "react";
import "./QuestionBox.css";

interface questionCardProps {
    question: string;
    imageUrl: string;
}

function QuestionBox({question, imageUrl}: questionCardProps) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [needsScroll, setNeedsScroll] = useState(false);

    useEffect(() => {
        if (textRef.current && containerRef.current) {
            const textHeight = textRef.current.scrollHeight;
            const containerHeight = containerRef.current.clientHeight;
            
            // Only enable scroll animation if text is taller than container
            setNeedsScroll(textHeight > containerHeight);
        }
    }, [question]);

    return (
        <div className="question-frame">
            <img className="question-frame-image" src={imageUrl} alt="Question Frame" />
            <div className="trivia-question" ref={containerRef}>
                <p 
                    ref={textRef} 
                    className={needsScroll ? "scroll-text" : ""}
                >
                    {question}
                </p>
            </div>
        </div>
    );
}

export default QuestionBox;