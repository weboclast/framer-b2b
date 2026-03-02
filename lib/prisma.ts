import { PrismaClient } from "@prisma/client";

export const prisma =
  (globalThis as unknown as { prisma: PrismaClient }).prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production")
  (globalThis as unknown as { prisma: PrismaClient }).prisma = prisma;

export default prisma;
