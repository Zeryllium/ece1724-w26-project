"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonBlueIndigo, buttonGrey } from "@/lib/ui";

export default function AssignmentTaker({
  courseId,
  moduleIndex,
  moduleId,
  studentId,
  existingSubmission,
  dueDate
}: {
  courseId: string;
  moduleIndex: number;
  moduleId: string;
  studentId: string;
  existingSubmission: any | null;
  dueDate?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const isSubmitted = existingSubmission && existingSubmission.assignmentState &&
    (existingSubmission.assignmentState.fileId || existingSubmission.assignmentState.fileUrl);
  const submissionFileId = existingSubmission?.assignmentState?.fileId;
  const legacyFileUrl = existingSubmission?.assignmentState?.fileUrl;
  const submissionUrl = submissionFileId ? `/api/gcs/${submissionFileId}/download` : legacyFileUrl;
  const submittedAt = isSubmitted ? new Date(existingSubmission.assignmentState.submittedAt).toLocaleString() : null;
  const isPastDue = dueDate ? new Date() > new Date(dueDate) : false;
  const isGraded = existingSubmission && existingSubmission.submissionStatus !== "INCOMPLETE";
  const aiGradingEnabled = true; // submission may take longer when AI is grading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPastDue) {
      setError("The deadline for this assignment has passed.");
      return;
    }
    if (!file) {
      setError("Please select a PDF file to submit.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("Uploading your file...");

    try {
      // Upload the PDF
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "SUBMISSION")
      formData.append("moduleId", moduleId)

      const signUploadRes = await fetch("/api/gcs/upload", {
        method: "POST",
        body: formData
      });

      const uploadData = await signUploadRes.json();
      if (!signUploadRes.ok) {
        throw new Error(uploadData.error || "Failed to upload PDF");
      }

      const uploadRes = await fetch(uploadData.signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type
        }
      });

      if (!uploadRes.ok) {
        throw new Error((await uploadRes.json()).error || "Failed to upload PDF to GCS")
      }

      // TODO:
      /*
        ******************************* IMPORTANT *******************************
        * Signed links expire after a short duration (5 minutes). You must rebuild
        * your links each time you want to access these files by going through the
        * routes. Store the fileId instead and query using that.
       */
      // Submit the assignment record
      setSuccess("File uploaded! AI is grading your submission, please wait...");
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentFileUrl: uploadData.fileId  // This cannot be a signed URL
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit assignment");
      }

      setSuccess("Assignment submitted and graded! Refreshing...");
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border p-6 rounded-xl shadow-sm mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Submission</h2>
        {isPastDue && <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase rounded border border-red-200">Deadline Passed</span>}
      </div>

      {isSubmitted ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
            <p className="font-semibold">Assignment Submitted</p>
            <p className="text-sm mt-1" suppressHydrationWarning>Submitted At: {submittedAt}</p>
          </div>
          <div>
            <a href={submissionUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
              View Your Submission
            </a>
          </div>

          {isGraded && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-900 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-indigo-800 uppercase tracking-wider">Grade Received</h4>
                  <p className="text-3xl font-black mt-1">{Number(existingSubmission.submissionGrade)} <span className="text-sm font-semibold text-indigo-500">/ 100</span></p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${existingSubmission.submissionStatus === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {existingSubmission.submissionStatus}
                  </span>
                </div>
              </div>

              {existingSubmission.assignmentState?.instructorFeedback && (
                <div className="pt-4 border-t border-indigo-200/50">
                  <h4 className="font-bold text-xs text-indigo-800 uppercase tracking-wider mb-2">Feedback & Comments</h4>
                  <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap bg-white/50 p-3 rounded border border-indigo-100/50">
                    {existingSubmission.assignmentState.instructorFeedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isPastDue && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2 text-slate-600">Resubmit Assignment</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="resubmit-file-upload"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="resubmit-file-upload"
                    className="cursor-pointer flex items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition-colors text-center bg-white"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-slate-700">
                        {file ? file.name : "Click to select a new PDF file"}
                      </span>
                    </div>
                  </label>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}
                <button type="submit" disabled={loading || isPastDue} className={buttonBlueIndigo + " " + (loading || isPastDue ? "opacity-50" : "")}>
                  {loading ? "Uploading..." : "Upload New Submission"}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 mb-2">Upload your assignment in PDF format.</p>

          <div className="relative">
            <input
              type="file"
              accept="application/pdf"
              required
              id="file-upload"
              className="hidden"
              disabled={isPastDue}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor={!isPastDue ? "file-upload" : undefined}
              className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 text-center ${isPastDue ? "bg-slate-100 border-slate-200 cursor-not-allowed" : "cursor-pointer border-slate-300 hover:bg-slate-50 transition-colors"}`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className={`w-8 h-8 ${isPastDue ? "text-slate-300" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className={`text-sm font-medium ${isPastDue ? "text-slate-400" : "text-slate-700"}`}>
                  {isPastDue ? "Submissions are closed" : (file ? file.name : "Click to select a PDF file")}
                </span>
                {!file && !isPastDue && <span className="text-xs text-slate-500">Maximum file size: 10MB</span>}
              </div>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}
          {!isPastDue && (
            <button type="submit" disabled={loading} className={buttonBlueIndigo + " w-full " + (loading ? "opacity-50" : "")}>
              {loading ? "Submitting..." : "Submit Assignment"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
