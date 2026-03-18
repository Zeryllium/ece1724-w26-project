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
  const [moduleResourceUri, setModuleResourceUri] = useState(initialData.moduleResourceUri || "");
  
  // quiz state defaults
  const defaultQuizConfig: QuizConfig = {
    timeLimit: 15,
    maxAttempts: 1,
    questions: [
      { id: Date.now().toString(), text: "", options: ["", ""], correctOptionIndex: 0 }
    ]
  };
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(initialData.quizConfig || defaultQuizConfig);
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
        moduleResourceUri: moduleType === "QUIZ" ? "" : moduleResourceUri 
      };

      if (moduleType === "QUIZ") {
        payload.quizConfig = quizConfig;
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
    <form onSubmit={handleSubmit} className="border p-6 rounded-lg shadow-sm space-y-4 w-full bg-white">
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

      {moduleType !== "QUIZ" ? (
        <div className="space-y-2">
          <label htmlFor="moduleResourceUri" className="block text-sm font-medium">
            Resource URL <span className="text-red-500">*</span>
          </label>
          <input
            id="moduleResourceUri"
            type="url"
            value={moduleResourceUri}
            onChange={(e) => setModuleResourceUri(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 text-black"
          />
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Limit (mins)</label>
               <input 
                  type="number" 
                  min="1"
                  value={quizConfig.timeLimit} 
                  onChange={(e) => setQuizConfig({...quizConfig, timeLimit: parseInt(e.target.value) || 1 })}
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
                  onChange={(e) => setQuizConfig({...quizConfig, maxAttempts: parseInt(e.target.value) || 1 })}
                  className="w-full border rounded-md px-3 py-2 text-black"
                  required
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
                         <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="text-slate-400 hover:text-red-500"><RxTrash size={16}/></button>
                       )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIndex)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 mt-2">
                    <RxPlus/> Add Option
                  </button>
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addQuestion} className={buttonGrey + " w-full border-dashed border-2 py-4"}>
               <RxPlus className="mr-2 inline"/> Add Another Question
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
