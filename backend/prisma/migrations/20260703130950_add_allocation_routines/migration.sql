-- CreateTable
CREATE TABLE "allocation_routines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_routine_items" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "routineId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_routine_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "allocation_routines_userId_idx" ON "allocation_routines"("userId");

-- CreateIndex
CREATE INDEX "allocation_routine_items_routineId_idx" ON "allocation_routine_items"("routineId");

-- CreateIndex
CREATE INDEX "allocation_routine_items_accountId_idx" ON "allocation_routine_items"("accountId");

-- CreateIndex
CREATE INDEX "allocation_routine_items_toAccountId_idx" ON "allocation_routine_items"("toAccountId");

-- AddForeignKey
ALTER TABLE "allocation_routines" ADD CONSTRAINT "allocation_routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_routine_items" ADD CONSTRAINT "allocation_routine_items_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "allocation_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_routine_items" ADD CONSTRAINT "allocation_routine_items_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_routine_items" ADD CONSTRAINT "allocation_routine_items_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
