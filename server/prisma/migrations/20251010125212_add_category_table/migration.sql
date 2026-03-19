/*
  Warnings:

  - You are about to drop the column `category` on the `Trivia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Trivia" DROP COLUMN "category";

-- CreateTable
CREATE TABLE "public"."MultiCat" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "triviaId" INTEGER NOT NULL,

    CONSTRAINT "MultiCat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."MultiCat" ADD CONSTRAINT "MultiCat_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "public"."Trivia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
