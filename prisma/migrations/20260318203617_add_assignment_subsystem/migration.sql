-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "commentId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "courseId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "assignmentConfig" JSONB,
ALTER COLUMN "moduleId" SET DEFAULT pg_catalog.gen_random_uuid();

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "assignmentState" JSONB;
