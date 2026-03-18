import {auth, isManaging, ROLES} from "@/lib/auth";
import {headers} from "next/headers";
import {forbidden, notFound, redirect} from "next/navigation";
import * as UI from "@/lib/ui";
import { prisma } from "@/lib/prisma";
import CourseEditorWrapper from "@/components/CourseEditorWrapper";
import Link from "next/link";
import {badgeModuleAssignment, badgeModuleLecture, badgeModuleQuiz, textH1Style, textLinkBack} from "@/lib/ui";

export default async function CourseEditPage(props: { params: Promise<{ courseId: string; }> }) {
  const {courseId} = await props.params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const _isManaging = await isManaging(session.user.id, courseId);

  if (!_isManaging && session.user.role != ROLES.ADMIN ) {
    forbidden();
  }

  let course = null
  try {
    course = await prisma.course.findUniqueOrThrow({
      where: { courseId },
    });
  } catch {
    notFound();
  }

  return (
    <div className={UI.mainContainer}>
      <div>
        <Link href={`/courses/${course.courseId}`} className={`${textLinkBack} mb-2 inline-block`}>
          &larr; Back to course: {course.courseName}
        </Link>

        <h1 className={textH1Style}>Editing Course: {course.courseName}</h1>
      </div>
      <div className={"border p-6 rounded-lg shadow-sm bg-white"}>
        <CourseEditorWrapper
          courseId={courseId}
          isManaging={true} // Already checked at the start of this page
          initialName={course.courseName}
          initialDescription={course.courseDescription ? course.courseDescription : ""}
        />
      </div>
    </div>
  )
}