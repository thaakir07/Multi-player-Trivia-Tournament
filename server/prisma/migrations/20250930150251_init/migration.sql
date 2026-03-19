-- CreateTable
CREATE TABLE "public"."User" (
    "player_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passsword" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "public"."Trivia" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "Trivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Option" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "triviaId" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Option" ADD CONSTRAINT "Option_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "public"."Trivia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
