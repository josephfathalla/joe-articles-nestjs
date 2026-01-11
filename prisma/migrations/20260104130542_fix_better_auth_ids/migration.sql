/*
  Warnings:

  - Added the required column `userId` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verification" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "verification_userId_idx" ON "verification"("userId");

-- AddForeignKey
ALTER TABLE "verification" ADD CONSTRAINT "verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
