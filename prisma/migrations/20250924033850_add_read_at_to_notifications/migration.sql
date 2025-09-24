/*
  Warnings:

  - You are about to drop the column `medalCount` on the `user` table. All the data in the column will be lost.
  - Added the required column `type` to the `medal` table without a default value. This is not possible if the table is not empty.
  - Made the column `icon` on table `medal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `color` on table `medal` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."MedalType" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- AlterTable
ALTER TABLE "public"."medal" ADD COLUMN     "type" "public"."MedalType" NOT NULL,
ALTER COLUMN "icon" SET NOT NULL,
ALTER COLUMN "color" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."notification" ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "medalCount",
ADD COLUMN     "bronzeMedals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goldMedals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "silverMedals" INTEGER NOT NULL DEFAULT 0;
