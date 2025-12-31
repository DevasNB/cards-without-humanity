/*
  Warnings:

  - The values [ROUND_ENDED] on the enum `Game_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `game` MODIFY `status` ENUM('WAITING_FOR_PLAYERS', 'PLAYING', 'GAME_ENDED') NOT NULL DEFAULT 'WAITING_FOR_PLAYERS';
