/*
  Warnings:

  - Added the required column `cep` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endereco` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "cargo" TEXT,
ADD COLUMN     "cargoGestor" TEXT,
ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "curso" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "endereco" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "nomeEmpresa" TEXT,
ADD COLUMN     "nomeUniversidade" TEXT,
ADD COLUMN     "periodo" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "setor" TEXT,
ADD COLUMN     "telefone" TEXT NOT NULL,
ADD COLUMN     "universidade" TEXT,
ADD COLUMN     "userType" TEXT NOT NULL;
