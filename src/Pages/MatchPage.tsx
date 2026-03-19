import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../Context/SocketContext";
import GameLayout from "../Components/GameLayout";
import Timer from "../Components/Timer";
import History from "../Components/History";
import QuestionBox from "../Components/QuestionBox";
import AnswerCard from "../Components/AnswerCard";
import ScoreCard from "../Components/ScoreCard";
import questionImage from '../assets/arcadeframe2.png';
import WaitingLobby from "./WaitingLobby";
import backgroundImage from '../assets/backgroundImage.jpg';
import { useRef } from "react";
import RoundOverlay from "./RoundOverlay";

interface Player {
  userId: number;
  username: string;
  avatar: string;
  status: string;
  score: number;
}

interface Match {
  id: number;
  hostId: string;
  difficulty: string;
  status: string;
  createdAt: string;
  numQuestions: number;
  categories: string[]
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionHistory {
  question: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
}

function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Match data
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const playersRef = useRef<Player[]>([]);
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currQuestion, setCurrQuestion] = useState<Question | null>(null);
  const [currQuestionIndex, setCurrQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);
  const [wait, setWait] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showRoundOverlay, setShowRoundOverlay] = useState(false);
  const [categories, setCategories] = useState<String[]>([]);

  const location = useLocation();
  const state = location.state as {categories: string[]} | undefined;


  // Track the current question's data to save to history
  const currentQuestionData = useRef<{
    question: string;
    options: string[];
    selectedAnswer: string | null;
    correctAnswer: string;
  } | null>(null);
  
  // User data
  const getCurrUser = () => {
    const portNumber = window.location.port;
    const userDataStr = localStorage.getItem(`user_${portNumber}`);
    if (userDataStr) {
      try {
        return JSON.parse(userDataStr);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return null;
  };

  const user = getCurrUser();

  // Fetch match data
  const fetchMatchData = async () => {
    console.log("=== FETCHMATCHDATA DEBUG ===");
    console.log("MatchId:", matchId);
    
    if (!matchId) {
      console.log("No matchId provided");
      setError("No match ID provided");
      setLoading(false);
      return;
    }

    try {
      const port = window.location.port;
      let token = localStorage.getItem(`currentToken_${port}`);
      if (token) {
        token = token.replace(/^"|"$/g, "");
      } else {
        console.log("No token found");
        setError("Authentication required");
        navigate("/");
        return;
      }

      console.log("Token found:", token ? "Yes" : "No");

      const url = `/api/getMatch/${matchId}`;
      console.log("Making request to:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        navigate("/");
        localStorage.removeItem(`currentToken_${port}`);
        return;
      }

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed data:", data);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        setError(`Invalid response from server: ${responseText.substring(0, 100)}...`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error("API error:", data.error);
        throw new Error(data.error || "Failed to fetch match data");
      }

      const foundMatch = data.match;
      console.log("Found match:", foundMatch);
      
      if (!foundMatch) {
        console.log("No match in response");
        setError("Match not found or you don't have access to it");
        setLoading(false);
        return;
      }

      console.log("Setting match data:", foundMatch);
      setMatch(foundMatch);
      setPlayers(foundMatch.players || []);
      setGameStarted(foundMatch.status === "IN_PROGRESS");
      setTotalQuestions(foundMatch.numQuestions || 10);

      setCategories(state?.categories || []);
      
    } catch (err) {
      console.error("Error fetching match data:", err);
      setError(err instanceof Error ? err.message : "Failed to load match");
    } finally {
      setLoading(false);
    }
  };

  const hasJoined = useRef(false);

  useEffect(() => {
    if (!socket || !matchId || !user || wait) return;
    if (!hasJoined.current) {
      hasJoined.current = true;
      socket.emit("join_match", {
        matchId: parseInt(matchId),
        userId: user.player_id
      });
    }


    const onPlayersUpdated = (data: any) => {
      console.log("Players updated:", data);
      setPlayers(data.players || []);
    };

    const onGameStarted = (data: any) => {
      console.log("Game started:", data);
      setGameStarted(true);
    };

    const onNewQuestion = (data: any) => {
      console.log("New question received:", data);
      
      // Initialize new question data
      currentQuestionData.current = {
        question: data.question,
        options: data.options,
        selectedAnswer: null,
        correctAnswer: ""
      };
      
        setCurrQuestion({
          id: data.questionId,
          question: data.question,
          options: data.options,
          correctAnswer: ""
        });
        setCurrQuestionIndex(data.questionIndex - 1);
        setTimeRemaining(Math.floor(data.timeLimit / 1000));
        setSelectedAnswer(null);
        setShowResults(false);
        setShowRoundOverlay(false);
      socket.off("match_joined");
    };

    const onTimeUp = async (data: any) => {
      console.log("Time up:", data);
      console.log("Correct answer:", data.correctAnswer);
      setTimeRemaining(0);
      setShowResults(true);
      if ((currQuestionIndex+1) % totalQuestions === 0 && currQuestionIndex !== 0) {
        setCurrentRound(Math.floor(currQuestionIndex / totalQuestions) + 1);
        setShowRoundOverlay(true);
      }
      
      // Store correct answer in ref for history
      if (currentQuestionData.current) {
        currentQuestionData.current.correctAnswer = data.correctAnswer;
      }

      if (currentQuestionData.current && currentQuestionData.current.correctAnswer) {
        const selectedAnswerText = currentQuestionData.current.selectedAnswer;
        setQuestionHistory(prev => [...prev, {
          question: currentQuestionData.current!.question,
          selectedAnswer: selectedAnswerText,
          correctAnswer: currentQuestionData.current!.correctAnswer,
          isCorrect: selectedAnswerText === currentQuestionData.current!.correctAnswer
        }]);
      }

      // Update the current question with correct answer
      setCurrQuestion(prev => prev ? { 
          ...prev,
          correctAnswer: data.correctAnswer 
        } : prev);
    };

    const onMatchEnded = (data: any) => {
      console.log("Match ended, navigating to results...");
      console.log("Match ended data:", data);
      console.log("Current players state:", players);
      console.log("Current playersRef:", playersRef.current);
      
      // Navigate to results page with player data from ref (always has latest value)
      setTimeout(() => {
        console.log("Navigating to /result with players:", playersRef.current);
        navigate("/result", { 
          state: { 
            finalScores: playersRef.current,
            matchId: matchId 
          } 
        });
      }, 2000);
    };

    const onError = (data: any) => {
      console.error("Socket error:", data);
      setError(data.message);
    };

    const onUpdateScore = (data: any) => {
      console.log("Scores updated:", data);
      if (data && data.scores) {
        const updatedPlayers = data.scores.map((s: any) => {
          const existing = players.find(p => p.userId === s.userId);
          return {
            ...existing,
            userId: s.userId,
            username: s.username,
            avatar: existing?.avatar || "",
            status: existing?.status || "WAITING",
            score: s.score
          };
        });
        
        setPlayers(updatedPlayers);
        playersRef.current = updatedPlayers; // Keep ref in sync
        console.log("Updated players:", updatedPlayers);
      }
    };

      socket.on("players_updated", onPlayersUpdated);
      socket.on("game_started", onGameStarted);
      socket.on("new_question", onNewQuestion)
      socket.on("scores_updated", onUpdateScore);
      socket.on("time_up", onTimeUp);
      socket.on("match_ended", onMatchEnded);
      socket.on("error", onError);

    return () => {    
      socket.off("players_updated", onPlayersUpdated);
      socket.off("game_started", onGameStarted);
      socket.off("new_question", onNewQuestion);
      socket.off("time_up", onTimeUp);
      socket.off("match_ended", onMatchEnded);
      socket.off("error", onError);
      socket.off("scores_updated", onUpdateScore);
    };
  }, [socket, matchId, currentRound, showRoundOverlay]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && gameStarted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, gameStarted]);

  // Load match data on component mount
  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  useEffect(() => {      
  if ((currQuestionIndex) % totalQuestions === 0 && currQuestionIndex !== 0) {
      setCurrentRound(Math.floor(currQuestionIndex / totalQuestions) + 1);
      setShowRoundOverlay(true);
  }
  }, [currentRound, showRoundOverlay]);

  const handleAnswerSelect = (index: number, label: string) => {
    if (selectedAnswer !== null || timeRemaining <= 0) return;
    
    setSelectedAnswer(index);
    console.log(`Selected answer ${index}: ${label}`);
    
    // Store selected answer in ref for history
    if (currentQuestionData.current) {
      currentQuestionData.current.selectedAnswer = label;
    }
    
    // Submit answer to server
    if (socket && matchId && currQuestion) {
      socket.emit("submit_answer", {
        matchId: parseInt(matchId),
        userId: user?.player_id,
        questionId: currQuestion.id,
        answer: label,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '1.5rem'
        }}>
          Loading match data...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '1.5rem',
          color: 'red'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/createLobby')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (!gameStarted) {
    return (<WaitingLobby/>) 
  }

  // Game in progress - show question or waiting for question
  if (!currQuestion) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '1.5rem'
        }}>
          Waiting for next question...
        </div>
      </div>
    );
  }

  // Game layout with actual question
  const rounds = categories?.map(
  (c) => `Match #${match?.id} - ${match?.difficulty} - ${c}`
  );
  const playerScores = players.map(p => ({
    name: p.username,
    score: p.score
  }));
  console.log("playerScores", playerScores);
  
  const playerStatus = {
    answered: players.filter(p => p.status === 'ANSWERED').map(p => p.username),
    waiting: players.filter(p => p.status !== 'ANSWERED').map(p => p.username)
  };

  return (
    <div>
      {!currQuestion ? (
        <div style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: '100vh',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          fontSize: '1.5rem'
        }}>
          Waiting for next question...
        </div>
      ) : (
        <div style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: '100vh',
        }}>
          <RoundOverlay
            roundNumber={currentRound}
            category={match?.categories[currentRound - 1] || "Unknown"}
            show={showRoundOverlay}
            onHide={() => setShowRoundOverlay(false)}
          />
          <GameLayout
            timer={<Timer timeRemaining={timeRemaining} />}
            history={
              <History
                rounds={rounds||[]}
                questionHistory={questionHistory}
                questionsPerRound={totalQuestions}
                currentQuestionIndex={currQuestionIndex}
              />
            }
            questionBox={
              <QuestionBox
                question={currQuestion.question}
                imageUrl={questionImage}
              />
            }
            answerCard={
              <AnswerCard
                answers={currQuestion.options}
                onSelect={handleAnswerSelect}
                selected={selectedAnswer}
                correctAnswer={currQuestion.correctAnswer}
                showResults={showResults}
              />
            }
            scoreCard={
              <ScoreCard
                matchName={`Match #${match?.id}`}
                playerScores={playerScores}
                playerStatus={playerStatus}
              />
            }
          />
        </div>
      )}
    </div>  
  );
};

export default MatchPage;