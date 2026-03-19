import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getMatchHistory(userId: number) {
  return await prisma.matchPlayer.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          result: {
            include: {
              finalScores: true,
              matchAnswers: true,
              matchQuestions: true,
            },
          },
          categories: { include: { category: true } },
          players: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
}