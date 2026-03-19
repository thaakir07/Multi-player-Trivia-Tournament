/*
  Warnings:

  - A unique constraint covering the columns `[userId,matchId]` on the table `FinalScores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matchId]` on the table `MatchResults` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchId` to the `MatchResults` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PlayerStatus" AS ENUM ('WAITING', 'READY');

-- DropForeignKey
ALTER TABLE "public"."FinalScores" DROP CONSTRAINT "FinalScores_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FinalScores" DROP CONSTRAINT "FinalScores_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchAnswers" DROP CONSTRAINT "MatchAnswers_matchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchAnswers" DROP CONSTRAINT "MatchAnswers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchAnswers" DROP CONSTRAINT "MatchAnswers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MatchQuestions" DROP CONSTRAINT "MatchQuestions_matchId_fkey";

-- AlterTable
ALTER TABLE "public"."MatchResults" ADD COLUMN     "matchId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" SERIAL NOT NULL,
    "hostId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "numQuestions" INTEGER NOT NULL,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchPlayer" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "playerStatus" "public"."PlayerStatus" NOT NULL DEFAULT 'WAITING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchCategory" (
    "matchId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "MatchCategory_pkey" PRIMARY KEY ("matchId","categoryId")
);

-- CreateIndex
CREATE INDEX "MatchPlayer_matchId_idx" ON "public"."MatchPlayer"("matchId");

-- CreateIndex
CREATE INDEX "MatchPlayer_userId_idx" ON "public"."MatchPlayer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPlayer_matchId_userId_key" ON "public"."MatchPlayer"("matchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE INDEX "MatchCategory_matchId_idx" ON "public"."MatchCategory"("matchId");

-- CreateIndex
CREATE INDEX "MatchCategory_categoryId_idx" ON "public"."MatchCategory"("categoryId");

-- CreateIndex
CREATE INDEX "FinalScores_matchId_idx" ON "public"."FinalScores"("matchId");

-- CreateIndex
CREATE INDEX "FinalScores_userId_idx" ON "public"."FinalScores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalScores_userId_matchId_key" ON "public"."FinalScores"("userId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchResults_matchId_key" ON "public"."MatchResults"("matchId");

-- AddForeignKey
ALTER TABLE "public"."MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchPlayer" ADD CONSTRAINT "MatchPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchCategory" ADD CONSTRAINT "MatchCategory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchCategory" ADD CONSTRAINT "MatchCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchResults" ADD CONSTRAINT "MatchResults_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchQuestions" ADD CONSTRAINT "MatchQuestions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."MatchQuestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchAnswers" ADD CONSTRAINT "MatchAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinalScores" ADD CONSTRAINT "FinalScores_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."MatchResults"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinalScores" ADD CONSTRAINT "FinalScores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;
