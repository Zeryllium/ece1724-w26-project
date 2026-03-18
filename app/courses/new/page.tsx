import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import CreateCourseForm from "@/components/CreateCourseForm";
import * as UI from "@/lib/ui";
import {textH1Style, textLinkBack} from "@/lib/ui";

export default async function NewCoursePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // Any authenticated user can now create a course!

  return (
    <>
      <div className={UI.mainContainer}>
        <div>
          <Link href={`/courses/`} className={`${textLinkBack} mb-2 inline-block`}>
            &larr; Back to courses
          </Link>

          <h1 className={textH1Style}>Create New Course</h1>
        </div>
        <div className={"border p-6 rounded-lg shadow-sm bg-white"}>
          <CreateCourseForm />
        </div>
      </div>
    </>
  );
}
