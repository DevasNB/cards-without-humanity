/*
  Warnings:

  - You are about to drop the column `roundNumber` on the `round` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `round` DROP FOREIGN KEY `Round_gameId_fkey`;

-- DropIndex
DROP INDEX `Round_gameId_roundNumber_key` ON `round`;

-- AlterTable
ALTER TABLE `round` DROP COLUMN `roundNumber`;