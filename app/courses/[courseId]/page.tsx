import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreateModuleForm from "@/components/CreateModuleForm";
import DeleteCourseButton from "@/components/DeleteCourseButton";
import DeleteModuleButton from "@/components/DeleteModuleButton";

export default async function CourseDetailPage(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role || ROLES.STUDENT;

  // We only support Instructor view right now
  if (role !== ROLES.INSTRUCTOR && role !== ROLES.ADMIN) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Student Course View</h1>
        <p>Viewing a course as a student is coming in the next iteration.</p>
      </div>
    );
  }

  // Ensure this instructor manages this course
  const isManaging = await prisma.managing.findUnique({
    where: {
      instructorId_courseId: {
        instructorId: session.user.id,
        courseId,
      }
    }
  });

  if (!isManaging && role !== ROLES.ADMIN) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl text-red-600 font-bold">Unauthorized</h1>
        <p>You do not have permission to manage this course.</p>
        <Link href="/courses" className="text-blue-500 hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  // Fetch the course and its modules, ordered correctly
  const course = await prisma.course.findUnique({
    where: { courseId },
    include: {
      modules: {
        orderBy: { moduleIndex: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-5xl space-y-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-6 rounded-xl border">
        <div>
          <Link href="/courses" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{course.courseName}</h1>
          <p className="text-gray-600 mt-2">{course.courseDescription || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
           {/* Edit Course Form not explicitly built yet, just a button stub */}
           <DeleteCourseButton courseId={course.courseId} courseName={course.courseName} />
        </div>
      </div>

      {/* Modules List */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Course Modules</h2>
        
        {course.modules.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 border rounded-md">This course has no modules yet.</p>
        ) : (
          <div className="space-y-4">
            {course.modules.map((mod) => (
              <div key={mod.moduleId} className="border rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4 bg-white shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                      Module {mod.moduleIndex}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                      {mod.moduleType}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{mod.moduleTitle}</h3>
                  {mod.moduleDescription && (
                    <p className="text-gray-600 text-sm mt-1">{mod.moduleDescription}</p>
                  )}
                  <a 
                    href={mod.moduleResourceUri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
                  >
                    View Resource &rarr;
                  </a>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 items-start md:items-end justify-start">
                  <Link href={`/courses/${course.courseId}/${mod.moduleIndex}`} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-black transition">
                    Edit
                  </Link>
                  <DeleteModuleButton courseId={course.courseId} moduleIndex={mod.moduleIndex} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new module form */}
      <div className="pt-8 border-t">
        <CreateModuleForm courseId={course.courseId} />
      </div>
    </div>
  );
}