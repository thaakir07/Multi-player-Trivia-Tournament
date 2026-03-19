import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export async function editUsername(userId: number, newUsername: string) {
  return await prisma.user.update({
    where : {player_id : userId},
    data: {username: newUsername},
  });
}

export async function editPassword(userId: number, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  return await prisma.user.update({
    where : {player_id : userId},
    data: {password: hashedPassword},
  });
}

export async function editImage(userId: number, newImage: string) {
  return await prisma.user.update({
    where : {player_id : userId},
    data: {avatar_url: newImage},
  });
}