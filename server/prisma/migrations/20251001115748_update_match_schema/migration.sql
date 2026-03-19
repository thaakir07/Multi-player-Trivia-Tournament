/*
  Warnings:

  - Added the required column `difficulty` to the `Trivia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `avatar_url` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Trivia" ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar_url" TEXT NOT NULL,
ADD COLUMN     "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "highScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "playerRanking" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."MatchResults" (
    "id" SERIAL NOT NULL,
    "timeOfMatch" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchQuestions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "triviaId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "MatchQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchAnswers" (
    "id" SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinalScores" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalScores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserMatches" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserMatches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserMatches_B_index" ON "public"."_UserMatches"("B");

-- AddForeignKey
ALTER TABLE "public"."MatchQuestions" ADD CONSTRAINT "MatchQuestions_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "public"."Trivia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchQuestions" ADD CONSTRAINT "MatchQuestions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."MatchQuestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinalScores" ADD CONSTRAINT "FinalScores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinalScores" ADD CONSTRAINT "FinalScores_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserMatches" ADD CONSTRAINT "_UserMatches_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."MatchResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserMatches" ADD CONSTRAINT "_UserMatches_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;
