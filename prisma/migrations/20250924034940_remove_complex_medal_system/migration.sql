/*
  Warnings:

  - You are about to drop the `medal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_medal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."medal" DROP CONSTRAINT "medal_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_medal" DROP CONSTRAINT "user_medal_awardedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_medal" DROP CONSTRAINT "user_medal_medalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_medal" DROP CONSTRAINT "user_medal_userId_fkey";

-- DropTable
DROP TABLE "public"."medal";

-- DropTable
DROP TABLE "public"."user_medal";

-- DropEnum
DROP TYPE "public"."MedalType";
