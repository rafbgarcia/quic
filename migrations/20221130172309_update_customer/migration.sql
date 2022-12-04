/*
  Warnings:

  - You are about to drop the column `id` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `email` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuer` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
CREATE TABLE "_prisma_new_Customer" (
    "issuer" STRING NOT NULL,
    "email" STRING NOT NULL,
    "phoneNumber" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("issuer")
);
INSERT INTO "_prisma_new_Customer" ("createdAt","updatedAt") SELECT "createdAt","updatedAt" FROM "Customer";
DROP TABLE "Customer" CASCADE;
ALTER TABLE "_prisma_new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
