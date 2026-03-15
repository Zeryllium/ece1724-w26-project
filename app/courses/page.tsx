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
      <div className="container mx-auto p-8 max-w-6xl space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{session.user.name || "Instructor"}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">Manage your courses, view enrollments, and organize modules.</p>
          </div>
          <Link 
            href="/courses/new" 
            className="shrink-0 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-primary/90 transition-all font-semibold"
          >
            + Create New Course
          </Link>
        </div>
          
        {managingRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-2xl text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Courses Yet</h2>
              <p className="text-muted-foreground max-w-sm">You are not managing any courses. Create your first course to start teaching!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managingRecords.map(({ course }) => (
                <Link key={course.courseId} href={`/courses/${course.courseId}`} className="block group h-full">
                  <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.courseName}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {course.courseDescription || "No description provided."}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span>{course._count.modules}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span>{course._count.enrollments}</span>
                      </div>
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