/*
  Warnings:

  - You are about to drop the column `coverImage` on the `blogpost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `blogpost` DROP COLUMN `coverImage`,
    ADD COLUMN `driveLink` TEXT NULL,
    ADD COLUMN `gallery` JSON NULL,
    ADD COLUMN `thumbnail` TEXT NULL;
