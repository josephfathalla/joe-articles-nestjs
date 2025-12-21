-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('long', 'short');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "type" "ArticleType" NOT NULL DEFAULT 'long';
