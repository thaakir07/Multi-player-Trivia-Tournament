import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

export async function userLogin(username: string) {
  return await prisma.user.findUnique({
    where: {
      username: username
    }
  })
}

export async function userScores() {
  const users = await prisma.user.findMany({
    include: {
      matchPlayers: true 
    }
  });

  const scores = users.map(user => ({
    username: user.username,
    score: user.matchPlayers.reduce((sum, mp) => sum + mp.score, 0)
  }));

  scores.sort((a, b) => b.score - a.score);

  return scores;
}

export async function userScore(username: string) {
  const user = await prisma.user.findUnique({
    where: {
      username: username
    },
    include: {
      matchPlayers: true
    }
  });

  if (user) {
    const score = user.matchPlayers.reduce((sum, mp) => sum + mp.score, 0);
    return score;
  } else {
    return 0;
  }
}
