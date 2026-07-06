-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
