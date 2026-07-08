-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "lineItems" JSONB,
ADD COLUMN     "merchantName" TEXT;
