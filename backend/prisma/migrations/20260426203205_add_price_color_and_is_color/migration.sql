-- AlterTable
ALTER TABLE "print_jobs" ADD COLUMN     "is_color" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "printers" ADD COLUMN     "price_color" DECIMAL(10,2);
