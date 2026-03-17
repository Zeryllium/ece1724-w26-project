import Link from "next/link";
import moduleIcon from "@/components/icons/module";
import peopleIcon from "@/components/icons/people";
import {ReactNode} from "react";
import {textH2Style} from "@/lib/ui";

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
  <Link key={course.courseId} href={href} className="block group h-full">
    <div
      className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
      <div>
        <h3
          className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{course.courseName}</h3>
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

export default function CoursesSection({sectionId, courseRecords, sectionTitle, sectionNoneFoundExplanation, displayCompletionStatus, button}: CoursesSectionProps) {
  return (
    <section id={sectionId}>
      <div className={"flex justify-between place-items-center"}>
        <h2 className={textH2Style}>{sectionTitle}</h2>
        {button ? button : <></>}
      </div>
      <hr className={"my-2 border-b"} />
      {courseRecords.length === 0 ? (
        <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center">
          <p className="text-slate-500">{sectionNoneFoundExplanation}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseRecords.map(({course, courseStatus}) => renderCourseCard(
            course,
            `/courses/${course.courseId}`,
            <>
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {moduleIcon()}
                <span>{course._count.modules} Module{course._count.modules !== 1 ? "s" : ""}</span>
              </div>
              {
                displayCompletionStatus ? (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${courseStatus === 'PASSED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {courseStatus}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {peopleIcon()}
                    <span>{course._count.enrollments} Enrolled</span>
                  </div>
                )
              }

            </>
          ))}
        </div>
      )}
    </section>
  )
}