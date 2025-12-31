/*
  Warnings:

  - Added the required column `endsAt` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `round` ADD COLUMN `endsAt` DATETIME(3) NOT NULL;
