/*
  Warnings:

  - You are about to drop the column `moduleResourceUri` on the `Module` table. All the data in the column will be lost.
  - The primary key for the `Submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[studentId,moduleId]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('FILE', 'QUIZ');

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "commentId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "courseId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "moduleResourceUri",
ALTER COLUMN "moduleId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
ADD COLUMN     "submissionType" "SubmissionType" NOT NULL DEFAULT 'FILE',
ADD CONSTRAINT "Submission_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "File" (
    "id" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "s3Path" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaderId" TEXT NOT NULL,
    "moduleId" UUID,
    "submissionId" UUID,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_s3Path_key" ON "File"("s3Path");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_moduleId_key" ON "Submission"("studentId", "moduleId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
