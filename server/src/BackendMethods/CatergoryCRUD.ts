import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function categoryCreate(catName: string) {
  return await prisma.category.create({
    data: {
        name: catName
    }
  })
}

export async function categoryDelete(catName: string) {
    return await prisma.category.create({
        data: {
            name: catName
        }
    })
}

export async function nameUpdate(oldName: string, newName: string) {
    return await prisma.category.update({
        where: {name: oldName},
        data: {name: newName},
    })
}