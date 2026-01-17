-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "viewedAt" DATETIME;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "viewedAt" DATETIME;
