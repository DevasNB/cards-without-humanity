/*
  Warnings:

  - A unique constraint covering the columns `[roundId,playerId]` on the table `RoundPick` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `roundpick` DROP FOREIGN KEY `RoundPick_roundId_fkey`;

-- DropIndex
DROP INDEX `RoundPick_roundId_cardId_playerId_key` ON `roundpick`;

-- CreateIndex
CREATE UNIQUE INDEX `RoundPick_roundId_playerId_key` ON `RoundPick`(`roundId`, `playerId`);

-- AddForeignKey
ALTER TABLE `RoundPick` ADD CONSTRAINT `RoundPick_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
