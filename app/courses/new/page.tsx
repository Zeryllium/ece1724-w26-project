import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, ROLES } from "@/lib/auth";
import CreateCourseForm from "@/components/CreateCourseForm";

export default async function NewCoursePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role || ROLES.STUDENT;

  // We only allow INSTRUCTOR or ADMIN to load the course creation page
  if (role !== ROLES.INSTRUCTOR && role !== ROLES.ADMIN) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl text-red-600 font-bold">Unauthorized</h1>
        <p>You must be an instructor to create a course.</p>
        <Link href="/courses" className="text-blue-500 hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl py-12">
      <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-800 transition font-medium mb-6 inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create a New Course</h1>
          <p className="text-muted-foreground text-sm mt-1">Fill out the basic details for your new offering.</p>
        </div>
        <CreateCourseForm />
      </div>
    </div>
  );
}
