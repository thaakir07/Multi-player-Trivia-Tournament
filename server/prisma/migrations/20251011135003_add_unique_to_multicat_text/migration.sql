/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `MultiCat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MultiCat_text_key" ON "MultiCat"("text");
