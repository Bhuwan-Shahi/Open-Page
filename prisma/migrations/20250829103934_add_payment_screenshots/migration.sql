/*
  Warnings:

  - You are about to drop the column `paymentId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "paymentId",
DROP COLUMN "paymentMethod",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "screenshotUploaded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."payment_screenshots" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_screenshots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payment_screenshots" ADD CONSTRAINT "payment_screenshots_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_screenshots" ADD CONSTRAINT "payment_screenshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
