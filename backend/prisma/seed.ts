// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/users.seed";
import { seedDecks } from "./seeds/decks.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  await prisma.user.deleteMany({});
  await prisma.deck.deleteMany({});

  const users = await seedUsers(prisma);
  console.log(`Seeded ${users.length} users.`);

  const decks = await seedDecks(prisma);
  console.log(`Seeded ${decks.length} decks and their cards.`);

  console.log("Seeding finished.");
}

try {
  await main();
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
