import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ModuleEditorWrapper from "@/components/ModuleEditorWrapper";

export default async function ModulePage(props: { params: Promise<{ courseId: string; moduleIndex: string }> }) {
  const { courseId, moduleIndex } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const index = parseInt(moduleIndex, 10);
  if (isNaN(index)) notFound();

  const moduleData = await prisma.module.findFirst({
    where: { courseId, moduleIndex: index },
    include: { course: true }
  });

  if (!moduleData) notFound();

  // Check if they are managing to enable editing UI
  const isManaging = await prisma.managing.findUnique({
    where: {
      instructorId_courseId: {
        instructorId: session.user.id,
        courseId,
      }
    }
  });

  const role = (session.user as any).role || ROLES.STUDENT;
  const canEdit = isManaging || role === ROLES.ADMIN;

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-8">
      <div>
        <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to {moduleData.course.courseName}
        </Link>
        
        <h1 className="text-3xl font-bold">Module {moduleData.moduleIndex}: {moduleData.moduleTitle}</h1>
        <div className="flex gap-2 mt-2">
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider">
               {moduleData.moduleType}
            </span>
        </div>
      </div>

      <div className="bg-white p-6 border rounded-xl shadow-sm">
         <p className="text-gray-700 whitespace-pre-line text-lg">
           {moduleData.moduleDescription || "No description provided."}
         </p>
         
         <div className="mt-8">
           <a 
              href={moduleData.moduleResourceUri} 
              target="_blank" 
              rel="noreferrer"
              className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
           >
              Open Resource
           </a>
         </div>
      </div>

      {canEdit && (
         <ModuleEditorWrapper courseId={courseId} moduleIndex={index} initialData={moduleData} />
      )}
    </div>
  );
}