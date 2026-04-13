import { PrismaClient } from "@prisma/client";

// Instancia unica do Prisma usada nas consultas ao banco.
export const prisma = new PrismaClient();
