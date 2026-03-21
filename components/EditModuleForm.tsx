"use client";

import { useState } from "react";
import { buttonBlueIndigo, buttonGrey } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { QuizConfig } from "@/lib/quiz-schema";
import { RxPlus, RxTrash } from "react-icons/rx";

export default function EditModuleForm({
  courseId,
  moduleIndex,
  initialData,
  onCancel
}: {
  courseId: string;
  moduleIndex: number;
  initialData: any;
  onCancel?: () => void;
}) {
  const [moduleTitle, setModuleTitle] = useState(initialData.moduleTitle || "");
  const [moduleDescription, setModuleDescription] = useState(initialData.moduleDescription || "");
  const [moduleType, setModuleType] = useState(initialData.moduleType || "LECTURE");

  // quiz state defaults
  const defaultQuizConfig: QuizConfig = {
    timeLimit: 15,
    maxAttempts: 1,
    dueDate: "",
    questions: [
      { id: Date.now().toString(), text: "", options: ["", ""], correctOptionIndex: 0 }
    ]
  };
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(initialData.quizConfig || defaultQuizConfig);

  // assignment state defaults
  const existingConfig = initialData.assignmentConfig || {};
  const [assignmentConfig, setAssignmentConfig] = useState({
    dueDate: existingConfig.dueDate || "",
    aiGradingEnabled: existingConfig.aiGradingEnabled || false,
    aiRubric: existingConfig.aiRubric || "",
    aiDifficulty: existingConfig.aiDifficulty || "standard"
  });
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        moduleTitle,
        moduleDescription,
        moduleType,
      };

      if (moduleType === "QUIZ") {
        payload.quizConfig = quizConfig;
      } else if (moduleType === "ASSIGNMENT") {
        payload.assignmentConfig = assignmentConfig;
      }

      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update module");
      }

      if (moduleType === "ASSIGNMENT" && assignmentFile) {
        const formData = new FormData();
        const moduleCreationTxnData = await res.json()
        formData.append("file", assignmentFile);
        formData.append("uploadType", "MODULE")
        formData.append("moduleId", moduleCreationTxnData.moduleId)

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
          body: assignmentFile,
          headers: {
            "Content-Type": assignmentFile.type
          }
        });

        if (!uploadRes.ok) {
          throw new Error((await uploadRes.json()).error || "Failed to upload PDF to GCS")
        }
      }

      setSuccess("Changes saved successfully!");
      router.refresh();

      setTimeout(() => {
        if (onCancel) onCancel();
      }, 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // quiz editor helpers
  const addQuestion = () => {
    setQuizConfig({
      ...quizConfig,
      questions: [...quizConfig.questions, { id: Date.now().toString(), text: "", options: ["", ""], correctOptionIndex: 0 }]
    });
  };

  const removeQuestion = (qIndex: number) => {
    const newQs = [...quizConfig.questions];
    newQs.splice(qIndex, 1);
    setQuizConfig({ ...quizConfig, questions: newQs });
  };

  const updateQuestion = (qIndex: number, field: string, value: any) => {
    const newQs = [...quizConfig.questions];
    (newQs[qIndex] as any)[field] = value;
    setQuizConfig({ ...quizConfig, questions: newQs });
  };

  const addOption = (qIndex: number) => {
    const newQs = [...quizConfig.questions];
    newQs[qIndex].options.push("");
    setQuizConfig({ ...quizConfig, questions: newQs });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQs = [...quizConfig.questions];
    newQs[qIndex].options[optIndex] = value;
    setQuizConfig({ ...quizConfig, questions: newQs });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const newQs = [...quizConfig.questions];
    if (newQs[qIndex].options.length <= 2) return; // Min 2 options
    newQs[qIndex].options.splice(optIndex, 1);
    // fix the correct answer index if options shift around
    if (newQs[qIndex].correctOptionIndex === optIndex) {
      newQs[qIndex].correctOptionIndex = 0;
    } else if (newQs[qIndex].correctOptionIndex > optIndex) {
      newQs[qIndex].correctOptionIndex--;
    }
    setQuizConfig({ ...quizConfig, questions: newQs });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Edit Module Details</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="space-y-2">
        <label htmlFor="moduleTitle" className="block text-sm font-medium">
          Module Title <span className="text-red-500">*</span>
        </label>
        <input
          id="moduleTitle"
          type="text"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 text-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="moduleType" className="block text-sm font-medium">
          Module Type <span className="text-red-500">*</span>
        </label>
        <select
          id="moduleType"
          value={moduleType}
          onChange={(e) => setModuleType(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
        >
          <option value="LECTURE">Lecture (Video/Reading)</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="QUIZ">Quiz</option>
        </select>
      </div>

      {moduleType === "ASSIGNMENT" && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {initialData.moduleResources ? `Replace Assignment PDF ${initialData.moduleResources.at(0).originalName}` : "Assignment PDF"}
            </label>
            <div className="relative mt-2">
              <input
                type="file"
                accept="application/pdf"
                id="instructor-edit-file-upload"
                className="hidden"
                onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="instructor-edit-file-upload"
                className="cursor-pointer flex items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center bg-white"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-sm font-medium text-slate-700">
                    {assignmentFile ? assignmentFile.name : "Click to replace PDF file"}
                  </span>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={assignmentConfig.dueDate}
              onChange={(e) => setAssignmentConfig({ ...assignmentConfig, dueDate: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-black bg-white"
              required
            />
          </div>

          {/* AI Grading Section */}
          <div className="pt-4 border-t border-slate-200 mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aiGradingEnabled"
                checked={assignmentConfig.aiGradingEnabled}
                onChange={(e) => setAssignmentConfig({ ...assignmentConfig, aiGradingEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="aiGradingEnabled" className="text-sm font-semibold text-slate-800">
                Enable AI Autograding (Experimental)
              </label>
            </div>

            {assignmentConfig.aiGradingEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-100">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Marking Rubric / Criteria <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={assignmentConfig.aiRubric}
                    onChange={(e) => setAssignmentConfig({ ...assignmentConfig, aiRubric: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-black text-sm outline-none focus:border-blue-500 transition-colors"
                    rows={4}
                    placeholder="e.g. 50% for correct final answer, 50% for working steps..."
                    required={assignmentConfig.aiGradingEnabled}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Marking Strictness
                  </label>
                  <select
                    value={assignmentConfig.aiDifficulty}
                    onChange={(e) => setAssignmentConfig({ ...assignmentConfig, aiDifficulty: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-black text-sm outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="lenient">Lenient (Forgiving on minor errors)</option>
                    <option value="standard">Standard (Balanced evaluation)</option>
                    <option value="strict">Strict (Penalizes all deviations)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {moduleType === "QUIZ" && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Limit (mins)</label>
              <input
                type="number"
                min="1"
                value={quizConfig.timeLimit}
                onChange={(e) => setQuizConfig({ ...quizConfig, timeLimit: parseInt(e.target.value) || 1 })}
                className="w-full border rounded-md px-3 py-2 text-black"
                required
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Attempts</label>
              <input
                type="number"
                min="1"
                value={quizConfig.maxAttempts}
                onChange={(e) => setQuizConfig({ ...quizConfig, maxAttempts: parseInt(e.target.value) || 1 })}
                className="w-full border rounded-md px-3 py-2 text-black"
                required
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date (Optional)</label>
              <input
                type="datetime-local"
                value={quizConfig.dueDate || ""}
                onChange={(e) => setQuizConfig({ ...quizConfig, dueDate: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-black bg-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2">Questions</h3>
            {quizConfig.questions.map((q, qIndex) => (
              <div key={q.id} className="bg-white border rounded-lg p-4 space-y-4 relative group">
                {quizConfig.questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RxTrash size={18} />
                  </button>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Question {qIndex + 1}</label>
                  <input type="text" value={q.text} onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)} placeholder="What is the..." required className="w-full border border-slate-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2 ml-4 border-l-2 border-slate-100 pl-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Answers <span className="font-normal normal-case text-slate-400">(Select the correct one)</span></p>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex flex-row items-center gap-2">
                      <input
                        type="radio"
                        name={`correctOption-${q.id}`}
                        checked={q.correctOptionIndex === optIndex}
                        onChange={() => updateQuestion(qIndex, 'correctOptionIndex', optIndex)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        required
                        className="flex-1 border rounded px-2 py-1 text-sm text-black"
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-slate-400 hover:text-red-500"><RxTrash size={16} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIndex)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 mt-2">
                    <RxPlus /> Add Option
                  </button>
                </div>
              </div>
            ))}

            <button type="button" onClick={addQuestion} className={buttonGrey + " w-full border-dashed border-2 py-4"}>
              <RxPlus className="mr-2 inline" /> Add Another Question
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="moduleDescription" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="moduleDescription"
          value={moduleDescription}
          onChange={(e) => setModuleDescription(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
          rows={3}
        />
      </div>

      <div className="flex gap-2 items-center">
        {success && <span className="text-green-600 text-sm font-semibold flex-1">{success}</span>}
        {!success && onCancel && (
          <button type="button" onClick={onCancel} disabled={loading} className={buttonGrey}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className={buttonBlueIndigo + (loading ? " opacity-50" : "")}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
