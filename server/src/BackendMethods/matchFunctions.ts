import { PrismaClient, MatchStatus, Prisma, PlayerStatus } from "@prisma/client";
import { error } from "console";
const prisma = new PrismaClient(); 
type MatchWithCategories = Prisma.MatchGetPayload<{
  include: { categories: true }
}>;


// Check.... arent these redundent 
export async function selectedNumQuestions(numQuestions: number) {
  return numQuestions
}

export async function selectedDifficulty(difficulty: number) {
  return difficulty
}

export async function selectedCategory(category: number) {
  return category
}

export async function createMatch(hostId: string, difficulty: string, numQuestions: number, categories: number[]) {
return await prisma.match.create({
    data: {
      hostId,
      difficulty,
      numQuestions,
      categories: {
        create: categories.map((categoryId) => ({
          category: {
            connect: { id: categoryId },
          },
        })),
      },
    },
  });

}

export async function getAllMatchesCat(categoryIds : number[]) {
  return await prisma.match.findMany({
    where: {
      categories: {
        some: {
          categoryId: { in: categoryIds },
        }
      }
    }
  })
}

export async function getAllMatchesDate(date : Date) {
  return await prisma.match.findMany({
    where: {
      createdAt: date
    }
  })
}

export async function getAllMatchesStatus(status : MatchStatus) {
  return await prisma.match.findMany({
    where: {
      status
    }
  })
}

export async function getMatchId(matchId : number, includeRelations: boolean) {
  return await prisma.match.findUnique({
    where: { id: matchId },
    ...(includeRelations && {
      include: {
        categories: true,
        players: true,
        result: true
      }
    })
  });
}

export async function deleteMatchId(id : number) {
  return await prisma.match.delete({
    where: {
      id
    }
  })
}

// This must add a player to the match
export async function joinMatch(matchid: number, player_id: number) {
    const match = await prisma.match.findUnique({
      where: {id: matchid},
      include: {players: true}
    });

    if (!match) {
      throw new Error("Match not found");
    }
    // if (match.status !== "WAITING") {
    //   throw new Error("Cannot join match that is already started");
    // }

    const existing = await prisma.matchPlayer.findUnique({
    where: {
      matchId_userId: {
        matchId: matchid,
        userId: player_id,
      },
    },
  });

  if (existing) {
    // User is already in the match, return the existing record
    return existing;
  }

    return await prisma.matchPlayer.create ({
      data: {
        matchId: matchid,
        userId: player_id,
        score: 0,
        playerStatus: "WAITING"
      }
    });

}

// THis must be able to delete a player from the match
export async function leaveMatch(matchid:number, player_id: number) {
    return await prisma.matchPlayer.delete({
      where: {
        matchId_userId: {
          matchId: matchid,
          userId: player_id
        }
      }
    });
}

// This should return the players in that match
export async function getPlayersInMatch(matchid:number) {
    return await prisma.matchPlayer.findMany({
      where: {
        matchId: matchid
      },
      include: {
        user: {
          select: {
            player_id: true,
            username: true,
            avatar_url: true,
          }
        }
      }
    });
}
// THis should update the players status to ready for the match to begin
export async function setPlayerReady(matchid:number, player_id:number) {
  const player = await prisma.matchPlayer.findUnique({
    where: {
      matchId_userId: {
        matchId: matchid,
        userId: player_id
      }
    }
  });
  
  if (!player) {
    throw new Error("Player not in match");
  }
  
  const newStatus: PlayerStatus = player.playerStatus === PlayerStatus.READY ? PlayerStatus.WAITING : PlayerStatus.READY;
  
  return await prisma.matchPlayer.update({
    where: {
      matchId_userId: {
        matchId: matchid,
        userId: player_id
      }
    },
    data: {
      playerStatus: newStatus
    }
  });
}
// THis should check that all the players are ready and change the status of the match to in_progress
export async function startMatch(matchid:number) {
  const match = await prisma.match.findUnique({
      where: {id: matchid},
      include: {players: true}
    });

    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "WAITING") {
      throw new Error("Match has already started");
    }
    if (match.players.length === 0) {
      throw new Error("Cannot start match with no players");
    }
    
    // Handle single player matches (host only)
    if (match.players.length === 1) {
      const hostPlayer = match.players[0];
      
      // Add explicit check for undefined (this fixes the TypeScript error)
      if (!hostPlayer) {
        throw new Error("Player data not found");
      }
      
      if (hostPlayer.playerStatus !== "READY") {
        // Auto-ready the single player (host)
        await prisma.matchPlayer.update({
          where: {
            matchId_userId: {
              matchId: matchid,
              userId: hostPlayer.userId
            }
          },
          data: {
            playerStatus: "READY"
          }
        });
        console.log("Auto-readied single player for match", matchid);
      }
    } else {
      // For multi-player matches, require all players to be ready
      const allReady = match.players.every((p: { playerStatus: string; }) => p.playerStatus === "READY" || p.playerStatus === "HOST");
      if (!allReady) {
        throw new Error("Not all players are ready");
      }
    }

    console.log("Starting match", matchid);
    return await prisma.match.update({
      where: {id: matchid},
      data: {status: "IN_PROGRESS"}
    });
}
// This should move to the next question
export async function nextQuestion(matchid: number) {
     // Get current match
  const match = await prisma.match.findUnique({
    where: { id: matchid }
  });
  
  if (!match) {
    throw new Error("Match not found");
  }
  
  // Check if we've reached the end
  if (match.currQuestionIndex >= match.numQuestions - 1) {
    throw new Error("No more questions in this match");
  }
  
  // Increment question index
  return await prisma.match.update({
    where: { id: matchid },
    data: {
      currQuestionIndex: match.currQuestionIndex + 1
    }
  });
}
// This should added the players answer to the database
export async function submitAnswer(
  matchid: number, 
  player_id: number,
  questionId: number,
  answer: string, 
  timeTaken: number
) {
  // Get the correct answer

  const question = await prisma.matchQuestions.findUnique({
    where: { id: questionId },
    include: { trivia: true }
  });

  const isCorrect = (answer === question?.trivia.answer);

  const matchResult = await prisma.matchResults.findUnique({
    where: { matchId: matchid }
  });
  if (!matchResult) throw new Error("MatchResults not found");

  
  // Create answer record
  const answerRecord = await prisma.matchAnswers.create({
    data: {
      matchId: matchResult.id,
      userId: player_id,
      questionId,
      answer,
      timeTaken
    }
  });
  
  // Update player score if correct
  if (isCorrect) {
    const points = calculatePoints(timeTaken);  // Your scoring logic
    
    await prisma.matchPlayer.update({
      where: {
        matchId_userId: {
          matchId: matchid,
          userId: player_id
        }
      },
      data: {
        score: {
          increment: points  // Add points to current score
        }
      }
    });
  }
  
  return answerRecord;
} 
// This should update the status of the match to done
export async function endMatch(matchid:number) {
  // Step 1: Update match status
  // Step 2: Get all players with their scores
  // Step 3: Create MatchResults record

  /*
  const match = await prisma.match.update({
    where: { id: matchid },
    data: { status: "COMPLETED" }
  });
  const players = await prisma.matchPlayer.findMany({
    where: { matchId: matchid }
  });

  const matchResults = await prisma.matchResults.create({
    data: {
      matchId: matchid,
      timeOfMatch: new Date()
    }
  });
  
  // Step 4: Create FinalScores for each player
  for (const player of players) {
    await prisma.finalScores.create({
      data: {
        matchId: matchid,
        userId: player.userId,
        score: player.score
      }
    });
    
    // Step 5: Update user statistics
    const user = await prisma.user.findUnique({
      where: { player_id: player.userId }
    });
    
    await prisma.user.update({
      where: { player_id: player.userId },
      data: {
        gamesPlayed: user!.gamesPlayed + 1,
        highScore: Math.max(user!.highScore, player.score)
      }
    });
  }
  
  return match;*/
}

function calculatePoints(timeTaken: number): number {
  // Example: 100 points - (time in seconds * 2)
  const seconds = timeTaken / 1000;
  return Math.max(0, Math.floor(100 - (seconds * 2)));
}