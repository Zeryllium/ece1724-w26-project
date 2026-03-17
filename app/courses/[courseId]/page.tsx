import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {auth, isEnrolled, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateModuleForm from "@/components/CreateModuleForm";
import DeleteModuleButton from "@/components/DeleteModuleButton";
import EnrollButton from "@/components/EnrollButton";
import RoleSetter from "@/components/RoleSetter";
import {
  mainContainer,
  textDescription,
  textLinkBack,
  textH1Style,
  buttonBaseStyling,
  buttonGreen,
  textH2Style, cardSectionFlex, cardClass
} from "@/lib/ui";
import {RxCardStack, RxCheck, RxChevronLeft} from "react-icons/rx";
import CourseEditorWrapper from "@/components/CourseEditorWrapper";

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

  let course = null
  try {
    course = await prisma.course.findUniqueOrThrow({
      where: {courseId},
      include: {
        modules: {
          orderBy: {moduleIndex: 'asc'}
        }
      }
    });
  } catch {
    // Invalid uuid or course not found

    // Note: Code Analysis may indicate that course is possibly null. However,
    // findUniqueOrThrow will never return a null object. A database miss would
    // always throw an Exception instead.
    notFound();
  }

  // Determine contextual role for Navbar
  let roleLabel: string | null = null;
  if (_isManaging) roleLabel = ROLES.INSTRUCTOR;
  else if (_isEnrolled) roleLabel = ROLES.STUDENT;

  return (
    <>
      <RoleSetter role={roleLabel}/>
      
      <div className={mainContainer}>
        {/* Header section (Hero) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-2/3">
            <Link href="/courses" className={`inline-flex items-center gap-2 text-sm font-medium mb-4 ${textLinkBack}`}>
              <RxChevronLeft/>
              Dashboard
            </Link>
            <h1 className={textH1Style}>{course.courseName}</h1>
            <p className={`mt-3 ${textDescription}`}>{course.courseDescription || "No description provided."}</p>
          </div>
          
          <div className="relative z-10 shrink-0">
             {_isManaging ? (
               <CourseEditorWrapper
                 isManaging={_isManaging}
                 courseId={course.courseId}
                 courseName={course.courseName}
                 initialName={course.courseName}
                 initialDescription={course.courseDescription || ""}
               />
             ) : !_isEnrolled ? (
               <EnrollButton courseId={course.courseId} />
             ) : (
               <button disabled className={`flex justify-center items-center gap-4 ${buttonBaseStyling} ${buttonGreen}`}>
                 <RxCheck/>
                 Enrolled
               </button>
             )}
          </div>
        </div>

        {/* Modules List */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className={textH2Style}>Course Curriculum</h2>
            <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">
              {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>

          <div className={`${cardSectionFlex} flex-col min-h-48`}>
            {course.modules.length === 0 ? (
              <div className={"grid grid-cols-1 justify-items-center"}>
                <div className={"text-muted-foreground bg-white p-3 rounded-full shadow-sm w-10 h-10 justify-self-center"}>
                  <RxCardStack />
                </div>
                <div className={"text-muted-foreground"}>{_isManaging ? "This course has no modules yet. Add one below." : "This course has no modules yet."}</div>
              </div>
            ) : (
              <>
                {course.modules.map((mod) => (
                  <div key={mod.moduleId} className="group border border-slate-100 rounded-xl p-6 my-2 mx-4 flex flex-col md:flex-row justify-self-stretch gap-6 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300">
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
              </>
            )}
          </div>
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