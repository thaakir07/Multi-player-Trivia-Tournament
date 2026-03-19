import { PrismaClient } from "@prisma/client";
import { Question } from "../webscrape";
const prisma = new PrismaClient();

export async function createQuestion(q: Question) {

  const doesExist = await prisma.trivia.findFirst({
    where: {
      question: q.question,
      // categories: {
      //   some: {
      //     text: q.category,
      //   },
      // },
    },
  });
  if (doesExist) {
    return;
  }

  return await prisma.trivia.create({
    data: {
      categories: {
        connectOrCreate: {
          where: { text: q.category },
          create: { text: q.category },
        },
      },
      question: q.question,
      difficulty: q.difficulty,
      answer: q.correct_answer,
      options: {
        create: [
          { text: q.correct_answer },
          ...q.incorrect_answers.map((optionText: string) => ({ text: optionText })),
        ],
      },
    },
  });
}
