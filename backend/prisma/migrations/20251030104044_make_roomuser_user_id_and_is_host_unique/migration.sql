/*
  Warnings:

  - A unique constraint covering the columns `[userId,isHost]` on the table `RoomUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RoomUser_userId_isHost_key` ON `RoomUser`(`userId`, `isHost`);
