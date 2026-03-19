import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function userCreate(username: string, email: string, password: string, avatar_url: string, role: string) {
  return await prisma.user.create({
    data: {
      username,
      email,
      password,
      avatar_url,
      role,
    },
  });
}
