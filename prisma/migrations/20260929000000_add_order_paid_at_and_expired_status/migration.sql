-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paidAt" TIMESTAMP(3);
