import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {auth, isEnrolled, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DeleteModuleButton from "@/components/DeleteModuleButton";
import EnrollButton from "@/components/EnrollButton";
import RoleSetter from "@/components/RoleSetter";
import * as UI from "@/lib/ui";
import { RxCardStackPlus, RxCheck, RxChevronLeft, RxLink1, RxLockClosed} from "react-icons/rx";
import {buttonBaseStyling, buttonGrey, lineBreak, sectionFlex} from "@/lib/ui";
import DeleteCourseButton from "@/components/DeleteCourseButton";
import CourseCalendar from "@/components/CourseCalendar";

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
          orderBy: {moduleIndex: 'asc'},
          include: {
            moduleResources: {
              orderBy: {
                createdAt: "desc"
              }
            }
          }
        }
      }
    });
  } catch {
    // gracefully handle bad course ids
    notFound();
  }

  // figure out what role badge to show
  let roleLabel: string | null = null;
  if (_isManaging) roleLabel = ROLES.INSTRUCTOR;
  else if (_isEnrolled) roleLabel = ROLES.STUDENT;

  return (
    <>
      <RoleSetter role={roleLabel}/>
      
      <div className={UI.mainContainer}>
        {/* hero section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
          {/* background blur */}
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
               <div className={"flex flex-col gap-2"}>
                 <Link href={`/courses/${course.courseId}/edit/`}>
                   <button className={`${buttonBaseStyling} ${buttonGrey}`}>
                     Edit Course
                   </button>
                 </Link>
                 <DeleteCourseButton courseId={courseId} courseName={course.courseName} />
               </div>
             ) : !_isEnrolled ? (
               <EnrollButton courseId={course.courseId} />
             ) : (
               <button disabled className={`flex justify-center items-center gap-4 ${UI.buttonGreen}`}>
                 <RxCheck/>
                 Enrolled
               </button>
             )}
          </div>
        </div>

        {/* module list section */}
        <div>
          <div className={sectionFlex}>
            <h2 className={UI.textH2Style}>Course Curriculum</h2>
            <span className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1 rounded-full">
              {course.modules.length} {course.modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>
          <hr className={lineBreak} />

          <div className={`${UI.cardSectionFlex} flex-col min-h-48`}>
            {course.modules.length === 0 ? (
              <div className={"text-muted-foreground text-center pb-6"}>{_isManaging ? "This course has no modules yet. Add one below." : "This course has no modules yet."}</div>
            ) : (
              <>
                {course.modules.map((mod) => (
                  <div key={mod.moduleId} className={`${UI.cardClass} p-6 m-2 gap-6 md:flex-row`}>
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
                        href={`/courses/${course.courseId}/module/${mod.moduleIndex}`}
                        className={`${UI.cardTextTitle} max-w-3xl`}>
                        {mod.moduleTitle}
                      </Link>
                      {mod.moduleDescription && (
                        <p className={`${UI.cardTextDescription} max-w-3xl`}>
                          {mod.moduleDescription}
                        </p>
                      )}
                      {mod.moduleType !== "QUIZ" && mod.moduleResources.length > 0 ? (
                        _isManaging || _isEnrolled ? (
                          <a
                            href={`/api/gcs/${mod.moduleResources.at(0)!.id}/download`}
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
                        )
                      ) : null}
                    </div>

                    {_isManaging && (
                      <div className="flex flex-row md:flex-col gap-2 items-start md:items-end justify-start shrink-0">
                        <Link href={`/courses/${course.courseId}/module/${mod.moduleIndex}`}>
                          <button className={`${UI.buttonGrey}`}>
                            View Details
                          </button>
                        </Link>
                        <DeleteModuleButton courseId={course.courseId} moduleIndex={mod.moduleIndex}/>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {_isManaging ? (
              <Link href={`/courses/${courseId}/module/new/`} className={"flex justify-center"}>
                <button data-testid="add-module-button" className={`${UI.cardClass} p-6 m-2 w-full text-muted-foreground`}>
                  <RxCardStackPlus />
                </button>
              </Link>
            ) : (
              <></>
            )}
          </div>
        </div>

        <CourseCalendar courseId={course.courseId} modules={course.modules} />

      </div>
    </>
  );
}