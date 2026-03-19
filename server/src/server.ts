import { Request, Response } from "express";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import router  from "./routes";

import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();
import cors from "cors";
import 'dotenv/config';

import {
  getPlayersInMatch,
  submitAnswer,
  endMatch,
  createMatch,
  joinMatch,
  setPlayerReady,
  startMatch,
  getMatchId
} from "./BackendMethods/matchFunctions"
import { getMatchQuestions } from "./BackendMethods/questionSelection";
import { match } from "assert";


//creates an express application
const app = express();
const port = 3000; //process.env.PORT || 3000

// Creates am HTTP server with the express app
const httpServer = createServer(app);

//Creates a Socket.IO server with the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // This allows the frontend to connect to origin
  },
});

app.use(cors({
  origin: true,
  credentials: true,
}));

//This facilitates the use of JSON endpoints
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
  res.type("text/html").send("<h1>Trivia Server Running </h1>");
});

app.use("/api", router);
interface MatchState {
  matchId: number;
  currentQuestionIndex: number;
  questionStartTime: number;
  answers: Map<number, { answer: string; timeTaken: number }>;
  timer: NodeJS.Timeout | null;
}

const matchStates = new Map<number, MatchState>();
// Track which socket belongs to which user in which match
const socketToUser = new Map<string, { userId: number; matchId: number }>();
const userToSocket = new Map<number, string>()


// Handle WebSocket connections
io.on("connection", (socket: Socket) => {
  console.log("New player connected:", socket.id);

    socket.on("authenticate", async (data: { userId: number; token: string }) => {
    try {
      // TODO: Verify JWT token here
      userToSocket.set(data.userId, socket.id);
      console.log(`User ${data.userId} authenticated`);
      socket.emit("authenticated", { success: true });
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("authentication_error", { message: "Invalid token" });
    }
  });


  // Join a match room 
   socket.on("join_match", async (data: { matchId: number; userId: number }) => {
    const { matchId, userId } = data;
    console.log(`User ${userId} attempting to join match ${matchId}`);

    try {
      // Verify match exists and is joinable
      const match = await getMatchId(matchId, true);
      if (!match) {
        return socket.emit("error", { message: "Match not found" });
      }
    
      if (match.status === "COMPLETED") {
        return socket.emit("error", { message: "Match has already ended" });
      }

      if (match.status === "IN_PROGRESS") {
        //return socket.emit("error", { message: "Match is already in progress" });
      }
      
      if (match.status !== "WAITING") {
        //return socket.emit("error", { message: "Match is not accepting new players" });
      }
      console.log("=== JOIN MATCH DEBUG ===");
      // Join the match in database
      await joinMatch(matchId, userId);

      // Join Socket.IO room
      socket.join(`match_${matchId}`);
      socketToUser.set(socket.id, { userId, matchId });

      console.log(`User ${userId} joined match ${matchId}`);

      // Get updated player list
      const players = await getPlayersInMatch(matchId);

      // Broadcast updated player list to all players in match
      io.to(`match_${matchId}`).emit("players_updated", {
        players: players.map(p => ({
          userId: p.userId,
          username: p.user.username,
          avatar: p.user.avatar_url,
          status: p.playerStatus,
          score: p.score,
          joinedAt: p.joinedAt
        }))
      });

      // Send match details to the joining player
      socket.emit("match_joined", {
        matchId,
        match: {
          id: match.id,
          hostId: match.hostId,
          difficulty: match.difficulty,
          status: match.status,
          createdAt: match.createdAt,
          // categories: match.categories
        },
        players: players.map(p => ({
          userId: p.userId,
          username: p.user.username,
          avatar: p.user.avatar_url,
          status: p.playerStatus,
          score: p.score
        }))
      });

      // Notify others about new player
      socket.to(`match_${matchId}`).emit("player_joined", {
        userId,
        username: players.find(p => p.userId === userId)?.user.username,
        message: `${players.find(p => p.userId === userId)?.user.username} joined the match`
      });

    } catch (error) {
      console.error("Error joining match:", error);
      socket.emit("error", { message: "Failed to join match" });
    }
  });

  socket.on("player_ready", async (data: {matchId: number; userId: number}) => {
    try {
      const players = await getPlayersInMatch(data.matchId);
      io.to(`match_${data.matchId}`).emit("players_updated", {
        players: players.map(p => ({
          userId: p.userId,
          username: p.user.username,
          status: p.playerStatus,
          score: p.score
        }))
      });
    } catch (error) {
        console.error("Error updating player status:", error);
    }
  });

  socket.on("start_game", async (data: {matchId: number}) => {
    const {matchId} = data;
    try {
      matchStates.set(matchId, {
        matchId,
        currentQuestionIndex: 0,
        questionStartTime: Date.now(),
        answers: new Map(),
        timer: null
      });

      // Retrieve questions for this match
      const questions = await getMatchQuestions(matchId);

      if (questions.length === 0) {
        throw new Error("No questions available for this match");
      }

      // Broadcast game to all player
      console.log("SEND");
      io.to(`match_${matchId}`).emit("game_started", {
        message: "Game is starting",
         totalQuestions: questions.length
      });
      console.log("SENT");

      // Create delay before sending first question
      setTimeout(() => {
        sendQuestion(matchId, 0, questions);
      }, 1500);
    } catch (error) {
      console.error("Error starting games:", error);
      socket.emit("error", {message: "Failed to start game"});
    }
  });

  socket.on("submit_answer", async (data: {
    matchId: number,
    userId: number,
    questionId: number,
    answer: string
  }) => {
    const {matchId, userId, questionId, answer} = data;
    console.log(`User ${userId} submitted answer for question ${questionId} in match ${matchId}`);
    try {
      const matchState = matchStates.get(matchId);
      if (!matchState) {
        return socket.emit("error", {message: "Match not found"});
      }

      // Calc time taken
      const timeTaken = Date.now() - matchState.questionStartTime;

      // Store answers in the data base
      await submitAnswer(matchId, userId, questionId, answer, timeTaken);

      // Track wherther answered or not
      matchState.answers.set(userId, {answer, timeTaken});

      // Notify all players when someone answers
      io.to(`match_${matchId}`).emit("player_answered", {
        userId,
        totalAnswered: matchState.answers.size
      });

      // Retreive updated scores for the match
      const players = await getPlayersInMatch(matchId);
      // Live score updates
      io.to(`match_${matchId}`).emit("scores_updated", {
        scores: players.map (p => ({
          userId: p.userId,
          username: p.user.username,
          score: p.score
        }))
      });

      console.log(`User ${userId} answered question ${questionId} in ${timeTaken}`);

    } catch (error) {
      console.error("Error submitting answer:", error);
      socket.emit("error", {message: "Failed to submit answer"});
    }
  });

  socket.on("leave_match", async (data: {matchId: number, userId: number}) => {
    const {matchId, userId} = data;
    try {
      socket.leave(`match_${matchId}`);
      socketToUser.delete(socket.id);

      // Notify other players that u left
      io.to(`match_${matchId}`).emit("players_left", {
        userId,
        messsage: `Player ${userId} has left the match`
      });

      // retreive updated players
      const players = await getPlayersInMatch(matchId);
      io.to(`match_${matchId}`).emit("players_updated", {
        players: players.map(p => ({
          userId: p.userId,
          username: p.user.username,
          status: p.playerStatus,
          score: p.score
        }))
      });

    } catch (error) {
      console.error("Error leaving match:", error)
    }
  });

  socket.on("disconnect", () => {
    const userInfo = socketToUser.get(socket.id);
    if (userInfo) {
      const {userId, matchId} = userInfo;
    }
  });


});

async function sendQuestion(matchId: number, questionIndex: number, questions: any[]) {
  const matchState = matchStates.get(matchId);
  if (!matchState) return;

  const question = questions[questionIndex];
  if (!question) {
    // No more questions - end the match
    await finishMatch(matchId);
    return;
  }

  // Reset for new question
  matchState.currentQuestionIndex = questionIndex;
  matchState.questionStartTime = Date.now();
  matchState.answers.clear();

  // Broadcast question to all players
  io.to(`match_${matchId}`).emit("new_question", {
    questionIndex: questionIndex + 1,
    totalQuestions: questions.length,
    question: question.question,
    options: question.trivia.options.map((opt: any) => opt.text),
    questionId: question.id,
    timeLimit: 20000 // 20 seconds in milliseconds
  });

  console.log(`📝 Sent question ${questionIndex + 1} to match ${matchId}`);

  // Set timer for this question
  matchState.timer = setTimeout(async () => {
    // if timesup show the correct answer
    io.to(`match_${matchId}`).emit("time_up", {
      correctAnswer: question.trivia.answer,
      explanation: "Time's up!"
    });

    // Wait 5 seconds for players to see answer, then send next question
    setTimeout(() => {sendQuestion(matchId, questionIndex + 1, questions)}, 3500)
  }, 20000);
}

async function finishMatch(matchId: number) {
  try {
    // End the match in database
    await endMatch(matchId);

    // Retrieve final scores
    const players = await getPlayersInMatch(matchId);
    const finalScores = players
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        username: p.user.username,
        score: p.score
      }));

    // Broadcast final results
    io.to(`match_${matchId}`).emit("match_ended", {
      message: "Match completed!",
      finalScores
    });

    // Clean up match state
    const matchState = matchStates.get(matchId);
    if (matchState && matchState.timer) {
      clearTimeout(matchState.timer);
    }
    matchStates.delete(matchId);

    console.log(` Match ${matchId} ended`);

  } catch (error) {
    console.error("Error finishing match:", error);
  }
}

//Start the combined server
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Trivia server running on http://localhost:${port}`);
});