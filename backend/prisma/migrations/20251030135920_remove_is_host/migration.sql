/*
  Warnings:

  - You are about to drop the column `isHost` on the `roomuser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `roomuser` DROP FOREIGN KEY `RoomUser_userId_fkey`;

-- DropIndex
DROP INDEX `RoomUser_userId_isHost_key` ON `roomuser`;

-- AlterTable
ALTER TABLE `roomuser` DROP COLUMN `isHost`;

-- Drop old FK
ALTER TABLE `Round` DROP FOREIGN KEY `Round_promptCardId_fkey`;

-- AddForeignKey
ALTER TABLE `Round` ADD CONSTRAINT `Round_promptCardId_fkey` FOREIGN KEY (`promptCardId`) REFERENCES `PromptCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
