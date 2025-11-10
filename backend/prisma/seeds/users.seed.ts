// prisma/seed/user.seed.ts
import { PrismaClient, UserRole } from "@prisma/client";

export async function seedUsers(prisma: PrismaClient): Promise<any[]> {
  console.log("Seeding users...");

  const adminUser = await prisma.user.upsert({
    where: { username: "player1" },
    update: {},
    create: {
      username: "admin",
      role: UserRole.ANONYMOUS,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { username: "player2" },
    update: {},
    create: {
      username: "player1",
      role: UserRole.ANONYMOUS,
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { username: "player3" },
    update: {},
    create: {
      username: "guest",
      role: UserRole.ANONYMOUS,
    },
  });

  console.log(
    `Created users: ${adminUser.username}, ${regularUser.username}, ${guestUser.username}`
  );

  return [adminUser, regularUser, guestUser];
}
