import CreateModuleWrapper from "@/components/CreateModuleWrapper";
import {auth, isManaging, ROLES} from "@/lib/auth";
import {headers} from "next/headers";
import {forbidden, redirect} from "next/navigation";
import * as UI from "@/lib/ui";
import Link from "next/link";

export default async function NewModulePage(props: { params: Promise<{ courseId: string }> }) {
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


  return (
    <div className={UI.mainContainer}>
      <Link href={`/courses/${courseId}`} className={`${UI.textLinkBack} mb-2 inline-block`}>
        &larr; Back to course
      </Link>
      <h1 className={UI.textH1Style}>
        Create a new module
      </h1>
      <div className={"border p-6 rounded-lg shadow-sm bg-white"}>
        <CreateModuleWrapper
          courseId={courseId}
        />
      </div>
    </div>
  )
}