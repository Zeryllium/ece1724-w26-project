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
    <div className="container mx-auto p-8 max-w-2xl space-y-6">
      <Link href="/courses" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
        &larr; Back to Dashboard
      </Link>
      
      <div className="bg-white p-2 rounded-xl">
        <CreateCourseForm />
      </div>
    </div>
  );
}
