import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()

// Lets the admin view all the questions
export async function adminViewQuestion(){
    return await prisma.trivia.findMany({
      include: {
        options: true,
        categories: true,
      },
    });
}


// Allows the admin to search the questions 
export async function adminSearch(search : string) {
  return await prisma.trivia.findMany({
    where: {
      question : {
        contains: search
      }
    }
  })
}

export async function updateQuestion(q: any) {
  // optional: check for duplicate question text in same categories
  const duplicate = await prisma.trivia.findFirst({
    where: {
      question: q.question,
      categories: { some: { text: { in: q.categories } } },
      NOT: { id: q.id },
    },
  });

  if (duplicate) {
    throw new Error("A question with this text already exists in those categories");
  }

  return await prisma.trivia.update({
    where: { id: q.id },
    data: {
      question: q.question,
      difficulty: q.difficulty,
      answer: q.answer,
      // handle categories (connect or create for each)
      categories: {
        connectOrCreate: q.categories.map((c:string) => ({
          where: { text: c },
          create: { text: c },
        })),
      },
      // replace existing options with new ones
      options: {
        deleteMany: {}, // remove all old options first
        create: q.options.map((opt: any) => ({
          text: opt.text,
        })),
      },
    },
  });
}

// Filters/Searches the question according to the category
export async function adminCat(category: string) {
  return await prisma.trivia.findMany({
    where: {
      categories: {
        some: {
          text: category
        }
      }
    },
    include: {
      categories: true
    }
  })
}

// Filters the question according to the difficulty
export async function adminFilterDiff(difficulty : string) {
  return await prisma.trivia.findMany({
    where: {
      difficulty
    }
  })
}

export async function adminDeleteQuestion(id: number) {
  // Delete related options
  await prisma.option.deleteMany({
    where: { triviaId: id },
  });

  // Delete related match questions
  const matchQuestions = await prisma.matchQuestions.findMany({
    where: { triviaId: id },
    select: { id: true },
  });

  const matchQuestionIds = matchQuestions.map(q => q.id);

  // Delete related match answers (through match questions)
  if (matchQuestionIds.length > 0) {
    await prisma.matchAnswers.deleteMany({
      where: { questionId: { in: matchQuestionIds } },
    });
  }

  // Delete match questions themselves
  await prisma.matchQuestions.deleteMany({
    where: { triviaId: id },
  });

  // Disconnect all category relations (join table cleanup)
  await prisma.trivia.update({
    where: { id },
    data: {
      categories: { set: [] },
    },
  });

  // Finally, delete the trivia question
  return await prisma.trivia.delete({
    where: { id },
  });
}


// Admin deletes a user by player_id
export async function adminDeleteUser(player_id: number) {
  // Remove User-MatchResults many-to-many links
  await prisma.user.update({
    where: { player_id },
    data: {
      matches: { set: [] }, // clears the relation
    },
  });

  // Delete related records that depend on User
  await prisma.matchAnswers.deleteMany({
    where: { userId: player_id },
  });

  await prisma.finalScores.deleteMany({
    where: { userId: player_id },
  });

  await prisma.matchPlayer.deleteMany({
    where: { userId: player_id },
  });

  // Delete the user itself
  return await prisma.user.delete({
    where: { player_id },
  });
}
