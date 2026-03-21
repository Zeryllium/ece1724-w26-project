"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonBlueIndigo, buttonGrey } from "@/lib/ui";

export default function InstructorAssignmentGrader({
  submissions,
  courseId,
  moduleIndex
}: {
  submissions: any[];
  courseId: string;
  moduleIndex: number;
}) {
  const router = useRouter();
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<Record<string, string>>(
    submissions.reduce((acc, sub) => {
      acc[sub.studentId] = sub.submissionGrade ? String(sub.submissionGrade) : "";
      return acc;
    }, {} as Record<string, string>)
  );
  const [feedback, setFeedback] = useState<Record<string, string>>(
    submissions.reduce((acc, sub) => {
      acc[sub.studentId] = sub.assignmentState?.instructorFeedback || "";
      return acc;
    }, {} as Record<string, string>)
  );
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleGradeChange = (studentId: string, value: string) => {
    setGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleFeedbackChange = (studentId: string, value: string) => {
    setFeedback((prev) => ({ ...prev, [studentId]: value }));
  };

  const submitGrade = async (studentId: string) => {
    const gradeVal = parseFloat(grades[studentId]);
    if (isNaN(gradeVal)) return;

    setLoadingIds((prev) => ({ ...prev, [studentId]: true }));
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, grade: gradeVal, feedback: feedback[studentId] })
      });

      if (!res.ok) {
        throw new Error("Failed to save grade");
      }
      setSuccessMsg(`Grade saved for student.`);
      router.refresh();
    } catch (e: any) {
      alert("Error saving grade: " + e.message);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-white p-6 border rounded-xl shadow-sm mt-8 text-center text-slate-500">
        No students have submitted this assignment yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border rounded-xl shadow-sm mt-8 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold">Student Submissions</h2>
         {successMsg && <div className="text-green-600 font-semibold text-sm">{successMsg}</div>}
      </div>
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b bg-slate-50 text-slate-600 text-sm">
            <th className="py-3 px-4 w-1/4">Student</th>
            <th className="py-3 px-4 w-1/5">Submitted At</th>
            <th className="py-3 px-4 w-1/5">File</th>
            <th className="py-3 px-4 w-1/5">Grade (0-100)</th>
            <th className="py-3 px-4 w-1/5">Feedback / Comments</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => {
            const hasSubmission = sub.assignmentState && (sub.assignmentState.fileId || sub.assignmentState.fileUrl);
            const fileId = sub.assignmentState?.fileId;
            const legacyFileUrl = sub.assignmentState?.fileUrl;
            const submittedAt = hasSubmission ? new Date(sub.assignmentState.submittedAt).toLocaleString() : "N/A";

            return (
              <tr key={sub.studentId} className="border-b hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <p className="font-semibold text-slate-800">{sub.student.name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{sub.student.email}</p>
                </td>
                <td className="py-4 px-4 text-sm text-slate-700" suppressHydrationWarning>
                  {submittedAt}
                </td>
                <td className="py-4 px-4">
                  {hasSubmission ? (
                    <a 
                       href={fileId ? `/api/gcs/${fileId}/download` : legacyFileUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Not submitted</span>
                  )}
                </td>
                <td className="py-4 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <input 
                       type="number"
                       min="0"
                       max="100"
                       value={grades[sub.studentId] || ""}
                       onChange={(e) => handleGradeChange(sub.studentId, e.target.value)}
                       disabled={!hasSubmission}
                       className="border rounded px-2 py-1 w-20 text-sm disabled:bg-slate-100"
                    />
                  </div>
                </td>
                <td className="py-4 px-4 align-top">
                  <textarea
                    value={feedback[sub.studentId] || ""}
                    onChange={(e) => handleFeedbackChange(sub.studentId, e.target.value)}
                    disabled={!hasSubmission}
                    className="border rounded px-2 py-1 w-full text-sm disabled:bg-slate-100 h-16"
                    placeholder="Enter marking feedback..."
                  />
                </td>
                <td className="py-4 px-4 align-top">
                  <button 
                     type="button"
                     onClick={() => submitGrade(sub.studentId)}
                     disabled={!hasSubmission || loadingIds[sub.studentId]}
                     className={buttonBlueIndigo + " py-1 px-4 text-sm whitespace-nowrap " + (!hasSubmission || loadingIds[sub.studentId] ? "opacity-50" : "")}
                  >
                     {loadingIds[sub.studentId] ? "Saving..." : "Save Grade"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
