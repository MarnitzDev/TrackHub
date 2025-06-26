/*
  Warnings:

  - Made the column `backgroundImage` on table `Board` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "backgroundImage" SET NOT NULL,
ALTER COLUMN "backgroundImage" SET DEFAULT 'default.png';
