-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "recurring" SET DEFAULT 'once',
ALTER COLUMN "recurring" SET DATA TYPE TEXT;
