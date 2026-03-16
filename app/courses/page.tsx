import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CoursesSection from "@/components/CoursesSection";

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
      <div className="container mx-auto p-8 max-w-6xl space-y-16 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session.user.name || "User"}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">Explore the marketplace, learn new skills, or teach your own courses.</p>
          </div>
          <Link 
            href="/courses/new" 
            className="shrink-0 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all font-semibold"
          >
            + Create New Course
          </Link>
        </div>

        {/* Enrolled Courses Section */}
        <CoursesSection courseRecords={enrolledRecords} sectionTitle={"Enrolled Courses"} sectionNoneFoundExplanation={"You are not enrolled in any courses yet."} displayCompletionStatus={true} />

        {/* Managed Courses Section */}
        <CoursesSection courseRecords={managingRecords} sectionTitle={"Courses You Teach"} sectionNoneFoundExplanation={"You have not created any courses yet."} />

        {/* Marketplace Section */}
        <CoursesSection courseRecords={marketplaceCourses} sectionTitle={"Course Marketplace"} sectionNoneFoundExplanation={"Currently no available courses."} />
      </div>
    </>
  );
}