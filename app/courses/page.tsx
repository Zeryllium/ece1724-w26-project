import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CoursesSection from "@/components/CoursesSection";
import {mainContainerClass} from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { RxChevronDown, RxPlus } from "react-icons/rx";

export default async function CoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all 3 categories concurrently
  const [managingRecords, enrolledRecords, _marketplaceCourses] = await Promise.all([
    // 1. Managed Courses
    prisma.managing.findMany({
      where: { instructorId: userId },
      include: {
        course: {
          include: { _count: { select: { modules: true, enrollments: true } } }
        }
      },
    }),

    // 2. Enrolled Courses
    prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: { _count: { select: { modules: true, enrollments: true } } }
        }
      }
    }),

    // 3. Marketplace Courses (User isn't managing and isn't enrolled)
    prisma.course.findMany({
      where: {
        AND: [
          { managing: { none: { instructorId: userId } } },
          { enrollments: { none: { studentId: userId } } }
        ]
      },
      include: {
        _count: { select: { modules: true, enrollments: true } }
      }
    })
  ]);
  // Fix marketplaceCourses missing top-level key "course"
  const marketplaceCourses = _marketplaceCourses.map(entry =>
  {
    return {course:entry}
  });


  return (
    <>
      <div className={mainContainerClass}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome, <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session.user.name || "User"}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">Explore the marketplace, learn new skills, or teach your own courses.</p>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <CoursesSection
          sectionId={"enrolledCourses"}
          courseRecords={enrolledRecords}
          sectionTitle={"Enrolled Courses"}
          sectionNoneFoundExplanation={"You are not enrolled in any courses yet."}
          displayCompletionStatus={true}
          button={
            <Button variant={"outline"} asChild className={"py-5 w-48 text-sm"}>
              <a href={"#marketplace"}>
                <RxChevronDown/>
                Enroll in a Course
              </a>
            </Button>
          }
        />

        {/* Managed Courses Section */}
        <CoursesSection
          sectionId={"managedCourses"}
          courseRecords={managingRecords}
          sectionTitle={"Courses You Teach"}
          sectionNoneFoundExplanation={"You have not created any courses yet."}
          button={
            <Button asChild className={"py-5 w-48 text-sm"}>
              <Link href={"/courses/new"}>
                <RxPlus/>
                Create New Course
              </Link>
            </Button>
          }
        />

        {/* Marketplace Section */}
        <CoursesSection
          sectionId={"marketplace"}
          courseRecords={marketplaceCourses}
          sectionTitle={"Course Marketplace"}
          sectionNoneFoundExplanation={"Currently no available courses."}
        />
      </div>
    </>
  );
}