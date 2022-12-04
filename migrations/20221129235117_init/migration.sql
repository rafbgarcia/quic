-- CreateTable
CREATE TABLE "Charge" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INT4 NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);
