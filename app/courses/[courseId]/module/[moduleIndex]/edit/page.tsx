import EditModuleWrapper from "@/components/EditModuleWrapper";
import {auth, isManaging, ROLES} from "@/lib/auth";
import {headers} from "next/headers";
import {forbidden, notFound, redirect} from "next/navigation";
import * as UI from "@/lib/ui";
import { prisma } from "@/lib/prisma";

export default async function ModuleEditPage(props: { params: Promise<{ courseId: string, moduleIndex: string }> }) {
  const {courseId, moduleIndex} = await props.params;

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

  const index = parseInt(moduleIndex, 10);
  if (isNaN(index)) notFound();

  let courseModule = null
  try {
    courseModule = await prisma.module.findFirstOrThrow({
      where: { courseId, moduleIndex: index },
      include: { course: true }
    });
  } catch {
    notFound();
  }

  return (
    <div className={UI.mainContainer}>
      <h1 className={UI.textH1Style}>
        Editing Module {moduleIndex}
      </h1>
      <div className={"border p-6 rounded-lg shadow-sm bg-white"}>
        <EditModuleWrapper
            courseId={courseId}
            moduleIndex={Number(moduleIndex)}
            initialData={courseModule}
        />
      </div>
    </div>
  )
}