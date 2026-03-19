import { PrismaClient } from "@prisma/client";
import { scrapeAndPostTrivia } from "../webscrape";
const prisma = new PrismaClient();

export async function selectQuestionsForMatch(
  categories: number[],
  difficulty: string,
  numQuestions: number
) {
  try {

  const cats = await prisma.category.findMany({
    where: { id: { in: categories } },
    select: { name: true }
  });

  const catnames = cats.map((c) => c.name.trim());
  let questions:any[] = [];

  let i = 0;
  while (i < catnames.length) {
    console.log("loopcat: " + catnames[i]);
    const qs = await prisma.trivia.findMany({
      where: {
        difficulty: difficulty.toLowerCase(),
        categories: {
          some: {
            text: String(catnames[i])
          }
        }
      },
      include: {
        options: true,
        categories: true
      },
      take: numQuestions
    });
    console.log("questions: ", qs);

    if (qs.length < numQuestions) {
      console.log("qs length: " + qs.length);
      await scrapeAndPostTrivia(numQuestions, difficulty, String(catnames[i]).trim());
    } else {
      questions.push(...qs);
      i++;
    }
  }

    if (questions.length < numQuestions * catnames.length) {
      throw new Error(`Not enough questions available. Found ${questions.length}, need ${numQuestions * catnames.length}`);
    }

    // Shuffle and select the required number
    // const shuffled = questions.sort(() => 0.5 - Math.random());
    // const selected = shuffled.slice(0, numQuestions);

    return questions;
  } catch (error) {
    console.error("Error selecting questions:", error);
    throw error;
  }
}

export async function createMatchQuestions(matchId: number, questions: any[]) {

  const matchResult = await prisma.matchResults.create({
    data: {
      matchId: matchId // or create a new match if needed
    }
  });

  // Store the selected questions for this match
  const matchQuestions = await Promise.all(
    questions.map(async (question) => {
      return await prisma.matchQuestions.create({
        data: {
          matchId: matchResult.id,
          triviaId: question.id,
          question: question.question
        }
      });
    })
  );

  return matchQuestions;
}

export async function getMatchQuestions(matchId: number) {
  const matchResult = await prisma.matchResults.findUnique({
    where: { matchId },
  });

  if (!matchResult) {
    throw new Error("No MatchResults found for this match");
  }

  return await prisma.matchQuestions.findMany({
    where: { matchId: matchResult.id },
    include: {
      trivia: {
        include: { options: true }
      }
    },
    orderBy: { id: "asc" }
  });
}

export async function getMatchCategories(matchId: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      categories: {
        include: {
          category: true // include the actual Category object
        }
      }
    }
  });

  if (!match) return [];

  // Extract only the category names
  return match.categories.map(c => c.category.name);
}
