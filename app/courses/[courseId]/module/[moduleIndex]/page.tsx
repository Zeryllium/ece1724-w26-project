import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {auth, isManaging, isEnrolled, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ModuleEditorWrapper from "@/components/ModuleEditorWrapper";
import QuizTaker from "@/components/QuizTaker";
import InstructorLrsDashboard from "@/components/InstructorLrsDashboard";
import {
  mainContainer,
  textH1Style,
  textDescription,
  buttonBlueIndigo,
  badgeModuleQuiz,
  badgeModuleLecture,
  badgeModuleAssignment,
  textH2Style,
  textLinkBack
} from "@/lib/ui";

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

  // figure out if they have edit permissions
  const role = (session.user as any).role || ROLES.STUDENT;
  const _isManaging = await isManaging(session.user.id, courseId);
  const _isEnrolled = await isEnrolled(session.user.id, courseId);

  const canEdit = _isManaging || role === ROLES.ADMIN;
  
  // kick uninvited users back to the preview
  if (!canEdit && !_isEnrolled) {
    redirect(`/courses/${courseId}`);
  }

  // grab any past submission to figure out remaining attempts and timer state
  const submission = await prisma.submission.findUnique({
    where: {
      studentId_moduleId: {
        studentId: session.user.id,
        moduleId: moduleData.moduleId
      }
    },
    include: {
      files: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  let metrics = null;
  if (canEdit && moduleData.moduleType === "QUIZ") {
    const totalEnrolled = await prisma.enrollment.count({
      where: { courseId }
    });
    
    const submissions = await prisma.submission.findMany({
      where: { moduleId: moduleData.moduleId }
    });

    const averageScore = submissions.length > 0
      ? submissions.reduce((acc, sub) => acc + Number(sub.submissionGrade), 0) / submissions.length
      : 0;

    metrics = {
      totalEnrolled,
      submissionsCount: submissions.length,
      averageScore
    };
  }

  const headerLeft = (
    <div>
      <Link href={`/courses/${courseId}`} className={`${textLinkBack} mb-2 inline-block`}>
        &larr; Back to {moduleData.course.courseName}
      </Link>
      
      <h1 className={textH1Style}>Module {moduleData.moduleIndex}: {moduleData.moduleTitle}</h1>
      <div className="flex gap-2 mt-3">
          <span className={moduleData.moduleType === 'QUIZ' ? badgeModuleQuiz : moduleData.moduleType === 'LECTURE' ? badgeModuleLecture : badgeModuleAssignment}>
             {moduleData.moduleType}
          </span>
      </div>
    </div>
  );

  const pageContent = (
    <>
      <div className="bg-white p-6 border rounded-xl shadow-sm mb-6">
         <p className={textDescription + " whitespace-pre-line"}>
           {moduleData.moduleDescription || "No description provided."}
         </p>
         
         {moduleData.moduleType !== "QUIZ" && submission.files.length > 0 ? (
           <div className="mt-8">
             <>{/*TODO */}</>
             {/*<a */}
             {/*   href={moduleData.moduleResourceUri} */}
             {/*   target="_blank" */}
             {/*   rel="noreferrer"*/}
             {/*   className={buttonBlueIndigo + " inline-block"}*/}
             {/*>*/}
             {/*   Open Resource*/}
             {/*</a>*/}
           </div>
         ) : null}
      </div>

      {moduleData.moduleType === "QUIZ" && moduleData.quizConfig && !canEdit && (
         <QuizTaker 
            courseId={courseId} 
            moduleIndex={moduleData.moduleIndex} 
            moduleId={moduleData.moduleId}
            studentId={session.user.id}
            studentName={session.user.name}
            studentEmail={session.user.email}
            quizConfig={moduleData.quizConfig as any} 
            existingSubmission={submission} 
         />
      )}

      {moduleData.moduleType === "QUIZ" && canEdit && metrics && (
        <div className="bg-white p-8 border rounded-xl shadow-sm mt-8">
          <h2 className={textH2Style + " mb-6"}>Quiz Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="border border-slate-100 rounded-lg p-6 bg-slate-50 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Submissions</p>
                <p className="text-4xl font-extrabold text-blue-600">{metrics.submissionsCount} <span className="text-lg text-slate-400 font-medium">/ {metrics.totalEnrolled}</span></p>
             </div>
             <div className="border border-slate-100 rounded-lg p-6 bg-slate-50 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Score</p>
                <p className="text-4xl font-extrabold text-indigo-600">{metrics.averageScore.toFixed(1)}%</p>
             </div>
             <div className="border border-slate-100 rounded-lg p-6 bg-slate-50 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Completion Rate</p>
                <p className="text-4xl font-extrabold text-emerald-600">
                   {metrics.totalEnrolled > 0 ? ((metrics.submissionsCount / metrics.totalEnrolled) * 100).toFixed(1) : "0.0"}%
                </p>
             </div>
          </div>
        </div>
      )}

      {moduleData.moduleType === "QUIZ" && canEdit && (
         <InstructorLrsDashboard courseId={courseId} moduleId={moduleData.moduleId} />
      )}
    </>
  );

  return (
    <div className={mainContainer}>
      {canEdit ? (
        <ModuleEditorWrapper 
          courseId={courseId} 
          moduleIndex={index} 
          initialData={moduleData} 
          headerLeft={headerLeft}
        >
          {pageContent}
        </ModuleEditorWrapper>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            {headerLeft}
          </div>
          {pageContent}
        </>
      )}
    </div>
  );
}