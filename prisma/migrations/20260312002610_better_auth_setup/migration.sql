/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `author_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `comment_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `comment_text` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Comment` table. All the data in the column will be lost.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `course_name` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `total_completed` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `total_enrolled` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Course` table. All the data in the column will be lost.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_id` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `course_status` on the `Enrollment` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `Enrollment` table. All the data in the column will be lost.
  - The primary key for the `Managing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_id` on the `Managing` table. All the data in the column will be lost.
  - You are about to drop the column `instructor_id` on the `Managing` table. All the data in the column will be lost.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_id` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_description` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_id` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_index` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_resource_uri` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_title` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `module_type` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Module` table. All the data in the column will be lost.
  - The primary key for the `Submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `module_id` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submission_grade` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submission_status` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentText` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseName` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseStatus` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Managing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructorId` to the `Managing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleDescription` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleIndex` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleResourceUri` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleTitle` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleType` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionGrade` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submissionStatus` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_author_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Managing" DROP CONSTRAINT "Managing_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Managing" DROP CONSTRAINT "Managing_instructor_id_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_module_id_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_student_id_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "author_id",
DROP COLUMN "comment_id",
DROP COLUMN "comment_text",
DROP COLUMN "course_id",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "authorId" UUID NOT NULL,
ADD COLUMN     "commentId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
ADD COLUMN     "commentText" TEXT NOT NULL,
ADD COLUMN     "courseId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId");

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "course_description",
DROP COLUMN "course_id",
DROP COLUMN "course_name",
DROP COLUMN "created_at",
DROP COLUMN "total_completed",
DROP COLUMN "total_enrolled",
DROP COLUMN "updated_at",
ADD COLUMN     "courseDescription" TEXT,
ADD COLUMN     "courseId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
ADD COLUMN     "courseName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalCompleted" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "totalEnrolled" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId");

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "course_id",
DROP COLUMN "course_status",
DROP COLUMN "student_id",
ADD COLUMN     "courseId" UUID NOT NULL,
ADD COLUMN     "courseStatus" "CourseStatus" NOT NULL,
ADD COLUMN     "studentId" UUID NOT NULL,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("studentId", "courseId");

-- AlterTable
ALTER TABLE "Managing" DROP CONSTRAINT "Managing_pkey",
DROP COLUMN "course_id",
DROP COLUMN "instructor_id",
ADD COLUMN     "courseId" UUID NOT NULL,
ADD COLUMN     "instructorId" UUID NOT NULL,
ADD CONSTRAINT "Managing_pkey" PRIMARY KEY ("instructorId", "courseId");

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
DROP COLUMN "course_id",
DROP COLUMN "created_at",
DROP COLUMN "module_description",
DROP COLUMN "module_id",
DROP COLUMN "module_index",
DROP COLUMN "module_resource_uri",
DROP COLUMN "module_title",
DROP COLUMN "module_type",
DROP COLUMN "updated_at",
ADD COLUMN     "courseId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "moduleDescription" TEXT NOT NULL,
ADD COLUMN     "moduleId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
ADD COLUMN     "moduleIndex" INTEGER NOT NULL,
ADD COLUMN     "moduleResourceUri" TEXT NOT NULL,
ADD COLUMN     "moduleTitle" TEXT NOT NULL,
ADD COLUMN     "moduleType" "ModuleType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_pkey",
DROP COLUMN "module_id",
DROP COLUMN "student_id",
DROP COLUMN "submission_grade",
DROP COLUMN "submission_status",
ADD COLUMN     "moduleId" UUID NOT NULL,
ADD COLUMN     "studentId" UUID NOT NULL,
ADD COLUMN     "submissionGrade" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "submissionStatus" "SubmissionStatus" NOT NULL,
ADD CONSTRAINT "Submission_pkey" PRIMARY KEY ("studentId", "moduleId");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "userId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Managing" ADD CONSTRAINT "Managing_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Managing" ADD CONSTRAINT "Managing_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
