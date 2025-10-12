// src/utils/prisma.ts
import { PrismaClient } from "@prisma/client";

// Global variable to hold the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Check if a global PrismaClient instance already exists
// If not, create a new one
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });

// In development, store the PrismaClient instance globally to reuse it
// across hot reloads, which prevents too many connections
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
