/*
  Warnings:

  - A unique constraint covering the columns `[gameId,roomUserId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Player_gameId_roomUserId_key` ON `Player`(`gameId`, `roomUserId`);

-- AddForeignKey
ALTER TABLE `Round` ADD CONSTRAINT `Round_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
