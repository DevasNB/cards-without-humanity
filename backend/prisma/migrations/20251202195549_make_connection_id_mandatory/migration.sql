/*
  Warnings:

  - Made the column `connectionId` on table `roomuser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `roomuser` MODIFY `connectionId` VARCHAR(191) NOT NULL;
