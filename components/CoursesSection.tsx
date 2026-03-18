import Link from "next/link";
import {ReactNode} from "react";
import * as UI from "@/lib/ui";
import {RxCardStack, RxPeople} from "react-icons/rx";

interface CourseInterface {
  _count: {
    modules: number;
    enrollments: number;
  }
  courseId: string;
  courseName: string;
  courseDescription?: string | null;
}

interface CoursesSectionProps {
  sectionId?: string;
  courseRecords: { course: CourseInterface, courseStatus?: string | null}[];
  sectionTitle: string;
  sectionNoneFoundExplanation: string;
  displayCompletionStatus?: boolean | null;
  button?: ReactNode;
}


const renderCourseCard = (course: CourseInterface, href: string, badges: React.ReactNode) => (
  <Link key={course.courseId} href={href} className="block group">
    <div
      className={`${UI.cardClass} p-6 h-48 justify-between items-start`}>
      <div>
        <h3
          className={`${UI.cardTextTitle}`}>
          {course.courseName}
        </h3>
        <p className={UI.cardTextDescription}>
          {course.courseDescription || "No description provided."}
        </p>
      </div>
      <div className={`${UI.badgeTray} border-t-2 pt-2 w-full justify-center gap-10`}>
        {badges}
      </div>
    </div>
  </Link>
);

export default function CoursesSection({sectionId, courseRecords, sectionTitle, sectionNoneFoundExplanation, displayCompletionStatus, button}: CoursesSectionProps) {
  return (
    <section id={sectionId}>
      <div className={"flex justify-between place-items-center"}>
        <h2 className={UI.textH2Style}>{sectionTitle}</h2>
        {button ? button : <></>}
      </div>
      <hr className={UI.lineBreak} />
      <div className={`${UI.cardSectionFlex} flex-col min-h-60`}>
        {courseRecords.length === 0 ? (
          <p className="text-muted-foreground text-center">
            {sectionNoneFoundExplanation}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-2">
            {courseRecords.map(({course, courseStatus}) => renderCourseCard(
              course,
              `/courses/${course.courseId}`,
              <>
                <div className={`flex items-center gap-1.5 ${UI.badgeModuleOther}`}>
                  <RxCardStack />
                  <span>{course._count.modules} Module{course._count.modules !== 1 ? "s" : ""}</span>
                </div>
                {
                  displayCompletionStatus ? (
                    <div className={`flex items-center gap-1.5 ${
                      courseStatus === 'PASSED' ? 
                        UI.badgePassed : UI.badgeIncomplete
                    }`}>
                      {courseStatus}
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 ${UI.badgeNumberEnrolled}`}>
                      <RxPeople />
                      <span>{course._count.enrollments} Enrolled</span>
                    </div>
                  )
                }
              </>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}