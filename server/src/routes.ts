import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";
import type { Request, Response } from "express";
import { userLogin, userScore, userScores } from "./BackendMethods/userFind";
import { Question, scrapeAndPostTrivia } from "./webscrape";
import { userCreate } from "./BackendMethods/userCreate";
import { adminDeleteUser,adminDeleteQuestion, adminViewQuestion, 
          adminSearch, adminCat, adminFilterDiff, updateQuestion } from "./BackendMethods/adminFunctions";
import { selectQuestionsForMatch, createMatchQuestions } from "./BackendMethods/questionSelection";
import {
  createMatch,
  getAllMatchesStatus,
  getAllMatchesCat,
  getMatchId,
  deleteMatchId,
  joinMatch,
  leaveMatch,
  getPlayersInMatch,
  setPlayerReady,
  startMatch,
  endMatch
} from "./BackendMethods/matchFunctions";

import { Category, PrismaClient, Prisma} from "@prisma/client";
const prisma = new PrismaClient();
type MatchWithCategories = Prisma.MatchGetPayload<{
  include: {
    categories: true,
    players: true,
    result: true
  }
}>;

import { createQuestion } from "./BackendMethods/questionFunctions";
import { editUsername, editPassword, editImage } from "./BackendMethods/userEditor";

//Call this in any request that requires token authentication
import { tokenAuthenticate } from "./middleware/tokenAuth";
// import { AnyARecord } from "dns";
// import { REPLCommand } from "repl";
// import { match } from "assert";
// import { categoryCreate } from "./BackendMethods/CatergoryCRUD";
import { getMatchHistory } from "./BackendMethods/matchHistory";


const router = Router();

// GET example (fetching)
router.get("/", (req: Request, res: Response) => {
  res.type("text/html").send("<h1>Trivia Server Running </h1>");
});

// User CRUD routes
router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password, avatar_url, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const newUser = await userCreate(username, email, hashedPassword, avatar_url, role);
    console.log(newUser);
    res.status(200).json(newUser);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const {username, password} = req.body;

  try {
    const user = await userLogin(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(404).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      {player_id: user.player_id, username: user.username, email: user.email},
      process.env.JWT_SECRET as string,
      {expiresIn: "4h"}
    )

    const refreshToken = jwt.sign(
      { id: user.player_id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Login successful",
      token,
      refreshToken,
      user
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/token", tokenAuthenticate, (req: Request, res: Response) => {
  res.status(202).json({ message: "Token is valid" });
})

router.post("/editUsername", tokenAuthenticate, async (req: Request, res: Response) => {
  const {newUsername} = req.body;
  const userId = (req as any).user.player_id;
  try {
    const updatedUser = await editUsername(userId, newUsername);
    res.status(200).json(updatedUser);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/editPassword", tokenAuthenticate, async (req: Request, res: Response) => {
  const {newPassword} = req.body;
  const userId = (req as any).user.player_id;
  try {
    const updatedPassword = await editPassword(userId, newPassword);
    res.status(200).json(updatedPassword);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/editImage", tokenAuthenticate, async (req: Request, res: Response) => {
  const {newImage} = req.body;
  const userId = (req as any).user.player_id;
  try {
    const updatedImage = await editImage(userId, newImage);
    res.status(200).json(updatedImage);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Admin routes
router.post("/deleteUser", tokenAuthenticate, async (req: Request, res: Response) => {
  const {id} = req.body;
  try {
    const deletedUser = await adminDeleteUser(id);
    res.status(200).json(deletedUser);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Question CRUD routes
router.post("/createQuestion", tokenAuthenticate, async (req: Request, res: Response) => {
  const {role, question} = req.body;
  let q: Question = question;
  if (role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log(JSON.stringify(question));
  try {
    const newQuestion = await createQuestion(q);
    res.status(200).json(newQuestion);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/addQuestions", async (req, res) => {
  const Questions: Question[] = req.body;

    try {
      for (let q of Questions) {
        try {
          await createQuestion(q);
        } catch (e: any) {
          console.error(e);
        }
      }
      res.status(200).json({message: "Question Posted!!"});
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
});

router.post("/getQuestion", tokenAuthenticate, async (req: Request, res: Response) => {
  const {search} = req.body;
  try {
    const question = await adminSearch(search);
    res.status(200).json(question);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/// Untested routes
router.get("/getAllQuestions", tokenAuthenticate, async (req: Request, res: Response) => {
  try {
    const allQuestions = await adminViewQuestion();
    res.status(200).json(allQuestions);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getDifficulty", tokenAuthenticate, async (req: Request, res: Response) => {
  const {difficulty} = req.body;
  try {
    const questions = await adminFilterDiff(difficulty);
    res.status(200).json(questions);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/userScores", tokenAuthenticate, async (req: Request, res: Response) => {
  try {
    const scores = await userScores();
    res.status(200).json(scores);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/userScore/:username", tokenAuthenticate, async (req: Request, res: Response) => {
  const { username } = req.params;
  try {
    const scores = await userScore(username!);
    res.status(200).json(scores);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/editQuestion", tokenAuthenticate, async (req: Request, res: Response) => {
  const {role, q} = req.body;
  if (role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const editedQuestion = await updateQuestion(q);
    res.status(200).json(editedQuestion);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/deleteQuestion", tokenAuthenticate, async (req: Request, res: Response) => {
  const {role, questionId} = req.body;
  if (role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const deletedQuestion = await adminDeleteQuestion(questionId);
    res.status(200).json(deletedQuestion);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Category CRUD routes
router.post("/createCategory", tokenAuthenticate, async (req: Request, res: Response) => {
  const {role, name} = req.body;
  if (role != "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    //const newCategory = await createCategory(name);
    //res.status(206).json(newCategory);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getCategory", tokenAuthenticate, async (req: Request, res: Response) => {
  const {categoryName} = req.body;
  try {
    const questions = await adminCat(categoryName);
    res.status(200).json(questions);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/createMatch", tokenAuthenticate, async (req: Request, res: Response) => {
  const {difficulty, numQuestions, categories} = req.body;
  const hostId = (req as any).user.player_id;

  console.log("=== CREATE MATCH WITH MULTICAT DEBUG ===");
  console.log("Categories received:", categories);

  try {
    if (!difficulty || !numQuestions || !categories) {
      return res.status(400).json({error: "Missing required fields"})
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({error: "Need to select at least one category"})
    }

    const categoryRecords = await Promise.all(
      categories.map(async (cat: string) => {
        return prisma.category.upsert({
          where: { name: cat },
          update: {},
          create: { name: cat },
        });
      })
    );

    const newMatch = await prisma.match.create({
      data: {
        hostId: hostId.toString(),
        difficulty,
        numQuestions,
        categories: {
          create: categoryRecords.map((cat) => ({
            category: { connect: { id: cat.id } },
          })),
        }
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    await joinMatch(newMatch.id, hostId);

    res.status(200).json({
      message: "Match created successfully with MultiCat",
      match: newMatch
    });
  } catch (e: any) {
    console.error("Error creating match with MultiCat:", e);
    res.status(500).json({error: e.message});
  }
});

router.post("/getAllMatches", tokenAuthenticate, async (req: Request, res: Response) => {
  try {
    const matches = await getAllMatchesStatus("WAITING");
    const matchesWithPlayers = await Promise.all(
      matches.map(async (match: { id: number; }) => {
        const players = await getPlayersInMatch(match.id);
        return {
          ...match,
          playerCount: players.length,
          players: players
        };
      })
    );

    res.status(200).json(matchesWithPlayers);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getMatch/:matchId", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.params as { matchId: string };
  const userId = (req as any).user.player_id;
  
  try {
    const matchIdNum = parseInt(matchId);
    if (isNaN(matchIdNum)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const match = await getMatchId(matchIdNum, true);
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const players = await getPlayersInMatch(matchIdNum);
    const userIsInMatch = match.hostId === userId.toString() || 
                         players.some(p => p.userId === userId);
    
    // if (!userIsInMatch) {
    //   return res.status(403).json({ error: "You don't have access to this match" });
    // }

    const matchWithPlayers = {
      ...match,
      players: players.map(p => ({
        userId: p.userId,
        username: p.user.username,
        avatar: p.user.avatar_url,
        status: p.playerStatus,
        score: p.score,
        joinedAt: p.joinedAt
      })),
      isHost: match.hostId === userId.toString(),
      playerCount: players.length
    };

    res.status(200).json({
      match: matchWithPlayers
    });
  } catch (e: any) {
    console.error("Error fetching match:", e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getMatchesByCategory", tokenAuthenticate, async (req: Request, res: Response) => {
  const {categories} = req.body;

  try {

    if (!categories || categories.length === 0) {
      return res.status(400).json({error: "Catagories required"})
    }
    const matches = await getAllMatchesCat(categories);
    res.status(200).json(matches);

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getMatchesByActivity", tokenAuthenticate, async(req: Request, res: Response) => {
  const { order } = req.query;

  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        updatedAt: order === 'asc' ? 'asc' : 'desc'
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true
              }
            }
          }
        }
      }
    });

    res.status(200).json(matches);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/joinMatch", tokenAuthenticate, async (req: Request, res: Response) => {
  console.log(req.body);
  const { matchId } = req.body;
  console.log(matchId);
  const userId = (req as any).user.player_id;
  console.log(userId);
  try {
    // Check if match exists
    const match = await getMatchId(matchId, false);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    if (match.status !== "WAITING") {
      return res.status(400).json({ error: "Cannot join match that has already started" });
    }

    const matchPlayer = await joinMatch(matchId, userId);

    res.status(200).json({
      message: "Successfully joined match",
      matchPlayer
    });
  } catch (e: any) {
    console.error(e);

    // Duplicate join attempt
    if (e.code === 'P2002') {
      return res.status(400).json({ error: "You are already in this match" });
    }

    res.status(500).json({ error: e.message });
  }
});

router.post("/leaveMatch", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.body;
  const userId = (req as any).user.player_id;

  try {
    await leaveMatch(matchId, userId);

    res.status(200).json({
      message: "Successfully left match"
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/setReady", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.body;
  const userId = (req as any).user.player_id;

  try {
    const updatedPlayer = await setPlayerReady(matchId, userId);

    res.status(200).json({
      message: "Player marked as ready",
      player: updatedPlayer
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/startMatch", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.body;
  const userId = (req as any).user.player_id;

  try {
    const match = await getMatchId(matchId, false);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (match.hostId !== userId.toString()) {
      return res.status(403).json({ error: "Only the host can start the match" });
    }

    const updatedMatch = await startMatch(matchId);

    console.log("Initializing questions for match:", matchId);

    // Get match with categories (including Category names)
    const matchWithCategories = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        categories: {
          include: { category: true }
        }
      }
    });

    if (!matchWithCategories) {
      return res.status(404).json({ error: "Match not found when fetching categories" });
    }

    // Extract category names
    const categoryIds = matchWithCategories.categories.map((mc: { categoryId: any; }) => mc.categoryId);
    // const categoryNames = matchWithCategories.categories.map(c => c.category.name);
    console.log("Selected categories:", categoryIds);

    // Now select questions based on category names
    const questions = await selectQuestionsForMatch(
      categoryIds,
      matchWithCategories.difficulty,
      matchWithCategories.numQuestions
    );

    console.log(`Selected ${questions.length} questions for match ${matchId}`);

    const matchQuestions = await createMatchQuestions(matchId, questions);
    console.log(`Created ${matchQuestions.length} match questions`);

    res.status(200).json({
      message: "Match started!",
      match: updatedMatch
    });
  } catch (e: any) {
    console.error("Error starting match:", e);
    res.status(400).json({ error: e.message });
  }
});

router.delete("/deleteMatch/:matchId", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.body;
  const userId = (req as any).user.player_id;
  const userRole = (req as any).user.role; // Assuming role is in JWT
  const matchIdNum = parseInt(matchId);

  try {
    const match = await getMatchId((matchIdNum), false);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Check authorization -> must be host or admin
    if (match.hostId !== userId.toString() && userRole !== "admin") {
      return res.status(403).json({ error: "Unauthorized to delete this match" });
    }

    // Can only delete if match hasn't started
    if (match.status !== "WAITING") {
      return res.status(400).json({ error: "Cannot delete match that has started" });
    }

    await deleteMatchId((matchIdNum));

    res.status(200).json({
      message: "Match deleted successfully"
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/getPlayers/:matchId", tokenAuthenticate, async (req: Request, res: Response) => {
  const matchIdParam = req.params.matchId;
  if (!matchIdParam) {
    return res.status(400).json({ error: "No matchId provided" });
  }

  const matchId = parseInt(matchIdParam);

  try {
    const players = await getPlayersInMatch(matchId);
    res.status(200).json(players);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/initializeMatchQuestions", tokenAuthenticate, async (req: Request, res: Response) => {
  const { matchId } = req.body;

  try {
    const match = await getMatchId(matchId, true);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Type assertion to tell TypeScript that match has categories
    const matchWithCategories = match as MatchWithCategories;

    // Extract category IDs
    const categoryIds = matchWithCategories.categories.map((mc: { categoryId: any; }) => mc.categoryId);
    //const categoryNames = matchWithCategories.categories.map(c => c.category.name);

    const questions = await selectQuestionsForMatch(
      categoryIds,
      matchWithCategories.difficulty,
      matchWithCategories.numQuestions
    );

    const matchQuestions = await createMatchQuestions(matchId, questions);

    res.status(200).json({
      message: "Questions initialized",
      questions: matchQuestions
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
    }
});

// Get user match history
router.post("/getHistory", async (req: Request, res: Response) => {
  const {userID} = req.body;
  console.log("User ID: " + userID);
  try {
    const history = await getMatchHistory(userID);
    console.log(history);
    res.status(200).json(history);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/getUserCurrentMatches", tokenAuthenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.player_id;

  try {
    // Get matches where user is either host or player, and status is WAITING or IN_PROGRESS
    const userMatches = await prisma.match.findMany({
      where: {
        OR: [
          { hostId: userId.toString() }, // User is the host
          {
            players: {
              some: {
                userId: userId // User is a player
              }
            }
          }
        ],
        status: {
          in: ["WAITING", "IN_PROGRESS"]
        }
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                username: true,
                avatar_url: true
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform the data to make it easier to use in frontend
    const transformedMatches = userMatches.map(match => ({
      id: match.id,
      hostId: match.hostId,
      difficulty: match.difficulty,
      numQuestions: match.numQuestions,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      isHost: match.hostId === userId.toString(),
      playerCount: match.players.length,
      categories: match.categories.map(mc => mc.category.name),
      players: match.players.map(player => ({
        id: player.userId,
        username: player.user.username,
        avatar_url: player.user.avatar_url,
        status: player.playerStatus,
        isReady: player.playerStatus === "READY"
      }))
    }));

    res.status(200).json({
      message: "User current matches retrieved successfully",
      matches: transformedMatches,
      totalMatches: transformedMatches.length
    });
  } catch (e: any) {
    console.error("Error getting user current matches:", e);
    res.status(500).json({ error: e.message });
  }
});


export default router;
