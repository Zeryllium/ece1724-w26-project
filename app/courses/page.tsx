import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role || ROLES.STUDENT;

  // Render Instructor View
  if (role === ROLES.INSTRUCTOR || role === ROLES.ADMIN) {
    const managingRecords = await prisma.managing.findMany({
      where: { instructorId: session.user.id },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true, enrollments: true }
            }
          }
        }
      },
    });

    return (
      <div className="container mx-auto p-8 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Welcome, {session.user.name || "Instructor"}!</h1>
          <Link 
            href="/courses/new" 
            className="mt-4 md:mt-0 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm font-medium"
          >
            + Create New Course
          </Link>
        </div>
          
        {managingRecords.length === 0 ? (
            <p className="text-gray-500">You are not managing any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managingRecords.map(({ course }) => (
                <Link key={course.courseId} href={`/courses/${course.courseId}`}>
                  <div className="border rounded-xl p-6 hover:border-black transition cursor-pointer shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{course.courseName}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {course.courseDescription || "No description provided."}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
                      <span>{course._count.modules} Modules</span>
                      <span>{course._count.enrollments} Students</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </div>
    );
  }

  // Render Student View (Out of scope for this task, so just a placeholder)
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <p>Student features are coming in the next iteration.</p>
    </div>
  );
}