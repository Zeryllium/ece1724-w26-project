import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export default async function CoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all 3 categories concurrently
  const [managingRecords, enrolledRecords, marketplaceCourses] = await Promise.all([
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

  const renderCourseCard = (course: any, href: string, badges: React.ReactNode) => (
    <Link key={course.courseId} href={href} className="block group h-full">
      <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.courseName}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {course.courseDescription || "No description provided."}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm font-medium">
          {badges}
        </div>
      </div>
    </Link>
  );

  return (
    <>
      <Navbar 
        name={session.user.name} 
        email={session.user.email} 
        role={null} 
        image={session.user.image} 
      />
      
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
        <section>
          <h2 className="text-2xl font-bold border-b pb-3 mb-6">Enrolled Courses</h2>
          {enrolledRecords.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500">You aren't enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledRecords.map(({ course, courseStatus }) => renderCourseCard(
                course, 
                `/courses/${course.courseId}`,
                <>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>{course._count.modules} Modules</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${courseStatus === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {courseStatus}
                  </div>
                </>
              ))}
            </div>
          )}
        </section>

        {/* Managed Courses Section */}
        <section>
          <h2 className="text-2xl font-bold border-b pb-3 mb-6">Courses You Teach</h2>
          {managingRecords.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500">You aren't instructing any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managingRecords.map(({ course }) => renderCourseCard(
                course, 
                `/courses/${course.courseId}`,
                <>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>{course._count.modules}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span>{course._count.enrollments}</span>
                  </div>
                </>
              ))}
            </div>
          )}
        </section>

        {/* Marketplace Section */}
        <section>
          <h2 className="text-2xl font-bold border-b pb-3 mb-6">Course Marketplace</h2>
          {marketplaceCourses.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center">
              <p className="text-slate-500">No other courses available in the marketplace right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceCourses.map((course) => renderCourseCard(
                course, 
                `/courses/${course.courseId}`,
                <>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>{course._count.modules}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span>{course._count.enrollments} Enrolled</span>
                  </div>
                </>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}