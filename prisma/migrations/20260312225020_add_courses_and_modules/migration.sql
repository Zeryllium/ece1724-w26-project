-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('LECTURE', 'ASSIGNMENT', 'QUIZ');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('INCOMPLETE', 'PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('INCOMPLETE', 'PASSED', 'DROPPED');

-- CreateTable
CREATE TABLE "Course" (
    "courseId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "courseName" TEXT NOT NULL,
    "courseDescription" TEXT,
    "totalEnrolled" BIGINT NOT NULL DEFAULT 0,
    "totalCompleted" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "commentText" TEXT NOT NULL,
    "courseId" UUID NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "Module" (
    "moduleId" UUID NOT NULL DEFAULT pg_catalog.gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "moduleIndex" INTEGER NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "moduleResourceUri" TEXT NOT NULL,
    "moduleTitle" TEXT NOT NULL,
    "moduleDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("moduleId")
);

-- CreateTable
CREATE TABLE "Managing" (
    "instructorId" TEXT NOT NULL,
    "courseId" UUID NOT NULL,

    CONSTRAINT "Managing_pkey" PRIMARY KEY ("instructorId","courseId")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "studentId" TEXT NOT NULL,
    "courseId" UUID NOT NULL,
    "courseStatus" "CourseStatus" NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("studentId","courseId")
);

-- CreateTable
CREATE TABLE "Submission" (
    "studentId" TEXT NOT NULL,
    "moduleId" UUID NOT NULL,
    "submissionStatus" "SubmissionStatus" NOT NULL,
    "submissionGrade" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("studentId","moduleId")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Managing" ADD CONSTRAINT "Managing_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Managing" ADD CONSTRAINT "Managing_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE RESTRICT ON UPDATE CASCADE;
