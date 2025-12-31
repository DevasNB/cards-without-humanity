-- AddForeignKey
ALTER TABLE `RoundPick` ADD CONSTRAINT `RoundPick_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Round`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
