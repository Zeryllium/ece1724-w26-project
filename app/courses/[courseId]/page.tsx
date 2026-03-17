import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {auth, isEnrolled, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateModuleForm from "@/components/CreateModuleForm";
import DeleteModuleButton from "@/components/DeleteModuleButton";
import EnrollButton from "@/components/EnrollButton";
import RoleSetter from "@/components/RoleSetter";
import * as UI from "@/lib/ui";
import {RxCardStack, RxCheck, RxChevronLeft, RxLink1, RxLockClosed} from "react-icons/rx";
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
      
      <div className={UI.mainContainer}>
        {/* Header section (Hero) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-2/3">
            <Link href="/courses" className={`inline-flex items-center gap-2 text-sm font-medium mb-4 ${UI.textLinkBack}`}>
              <RxChevronLeft/>
              Dashboard
            </Link>
            <h1 className={UI.textH1Style}>{course.courseName}</h1>
            <p className={`mt-3 ${UI.textDescription}`}>{course.courseDescription || "No description provided."}</p>
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
               <button disabled className={`flex justify-center items-center gap-4 ${UI.buttonBaseStyling} ${UI.buttonGreen}`}>
                 <RxCheck/>
                 Enrolled
               </button>
             )}
          </div>
        </div>

        {/* Modules List */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className={UI.textH2Style}>Course Curriculum</h2>
            <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">
              {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>

          <div className={`${UI.cardSectionFlex} flex-col min-h-48`}>
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
                  <div key={mod.moduleId} className={UI.cardClass}>
                    <div className="flex-1">
                      <div className={`${UI.badgeTray} mb-3`}>
                        <span className={UI.badgeModuleIndex}>
                          Module {mod.moduleIndex}
                        </span>
                        <span className={
                          mod.moduleType === "LECTURE" ? UI.badgeModuleLecture :
                          mod.moduleType === "QUIZ" ? UI.badgeModuleQuiz :
                          mod.moduleType === "ASSIGNMENT" ? UI.badgeModuleAssignment :
                          UI.badgeModuleOther
                        }>
                          {mod.moduleType}
                        </span>
                      </div>
                      <Link
                        href={`/courses/${course.courseId}/${mod.moduleIndex}`}
                        className={`${UI.cardTextTitle} max-w-3xl`}>
                        {mod.moduleTitle}
                      </Link>
                      {mod.moduleDescription && (
                        <p className={`${UI.cardTextDescription} max-w-3xl`}>
                          {mod.moduleDescription}
                        </p>
                      )}
                      {_isManaging || _isEnrolled ? (
                        <a
                          href={mod.moduleResourceUri}
                          target="_blank"
                          rel="noreferrer"
                          className={`${UI.cardTextURI} inline-flex items-center gap-1 mt-2`}
                        >
                          View Attached Resource
                          <RxLink1 />
                        </a>
                      ) : (
                        <p className={`${UI.cardTextURILocked} inline-flex items-center gap-1 mt-2`}>
                          <RxLockClosed />
                          Enroll to view resources
                        </p>
                      )}
                    </div>

                    {_isManaging && (
                      //TODO: Convert this into a modal instead
                      <div className="flex flex-row md:flex-col gap-2 items-start md:items-end justify-start shrink-0">
                        <Link href={`/courses/${course.courseId}/${mod.moduleIndex}`}>
                          <button className={`${UI.buttonBaseStyling} ${UI.buttonGrey}`}>
                            Edit Module
                          </button>
                        </Link>
                        <DeleteModuleButton courseId={course.courseId} moduleIndex={mod.moduleIndex}/>
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