import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {auth, isEnrolled, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateModuleForm from "@/components/CreateModuleForm";
import DeleteCourseButton from "@/components/DeleteCourseButton";
import DeleteModuleButton from "@/components/DeleteModuleButton";
import EnrollButton from "@/components/EnrollButton";
import RoleSetter from "@/components/RoleSetter";

export default async function CourseDetailPage(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const _isManaging = await isManaging(session.user.id, courseId);
  const _isEnrolled = await isEnrolled(session.user.id, courseId);

  const course = await prisma.course.findUnique({
    where: { courseId },
    include: {
      modules: {
        orderBy: { moduleIndex: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Determine contextual role for Navbar
  let roleLabel: string | null = null;
  if (_isManaging) roleLabel = ROLES.INSTRUCTOR;
  else if (_isEnrolled) roleLabel = ROLES.STUDENT;

  return (
    <>
      <RoleSetter role={roleLabel}/>
      
      <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-12 pb-24">
        {/* Header section (Hero) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-2/3">
            <Link href="/courses" className="text-sm text-slate-500 hover:text-slate-800 transition font-medium mb-4 inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{course.courseName}</h1>
            <p className="text-slate-600 mt-3 text-lg leading-relaxed">{course.courseDescription || "No description provided."}</p>
          </div>
          
          <div className="relative z-10 shrink-0">
             {_isManaging ? (
               <DeleteCourseButton courseId={course.courseId} courseName={course.courseName} />
             ) : !_isEnrolled ? (
               <EnrollButton courseId={course.courseId} />
             ) : (
               <div className="bg-green-100 text-green-800 px-5 py-2.5 rounded-xl font-bold border border-green-200 shadow-sm flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 Enrolled
               </div>
             )}
          </div>
        </div>

        {/* Modules List */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold tracking-tight">Course Curriculum</h2>
            <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">
              {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>
          
          {course.modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-dashed rounded-2xl text-center">
              <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-muted-foreground">{_isManaging ? "This course has no modules yet. Add one below." : "This course has no modules yet."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((mod) => (
                <div key={mod.moduleId} className="group border border-slate-100 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        Module {mod.moduleIndex}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase ${
                        mod.moduleType === 'LECTURE' ? 'bg-blue-100 text-blue-800' :
                        mod.moduleType === 'QUIZ' ? 'bg-orange-100 text-orange-800' :
                        mod.moduleType === 'ASSIGNMENT' ? 'bg-purple-100 text-purple-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {mod.moduleType}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{mod.moduleTitle}</h3>
                    {mod.moduleDescription && (
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-3xl">{mod.moduleDescription}</p>
                    )}
                    {_isManaging || _isEnrolled ? (
                      <a 
                        href={mod.moduleResourceUri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm mt-4 inline-flex items-center gap-1 font-semibold"
                      >
                        View Attached Resource
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 mt-4 font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Enroll to view resources
                      </p>
                    )}
                  </div>
                  
                  {_isManaging && (
                    <div className="flex flex-row md:flex-col gap-2 items-start md:items-end justify-start shrink-0">
                      <Link href={`/courses/${course.courseId}/${mod.moduleIndex}`} className="text-sm font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700 transition inline-block text-center w-full md:w-auto">
                        Edit Module
                      </Link>
                      <DeleteModuleButton courseId={course.courseId} moduleIndex={mod.moduleIndex} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new module form */}
        {_isManaging && (
          <div className="pt-10">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add New Module
              </h3>
              <CreateModuleForm courseId={course.courseId} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}