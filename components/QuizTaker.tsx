"use client";

import { useState, useEffect } from "react";
import { buttonBlueIndigo, buttonGrey } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { QuizConfig } from "@/lib/quiz-schema";
import QuizTracker from "./QuizTracker";

export default function QuizTaker({
  courseId,
  moduleIndex,
  moduleId,
  studentId,
  studentName,
  studentEmail,
  quizConfig,
  existingSubmission
}: {
  courseId: string;
  moduleIndex: number;
  moduleId?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  quizConfig: QuizConfig;
  existingSubmission: any;
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quizConfig.timeLimit * 60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ grade: number, attemptsRemaining: number } | null>(null);

  const attemptsTaken = existingSubmission?.quizState?.attempts || 0;
  const attemptsRemainingInitial = quizConfig.maxAttempts - attemptsTaken;
  const dueDateParam = quizConfig.dueDate;
  const isPastDue = dueDateParam ? new Date() > new Date(dueDateParam) : false;

  useEffect(() => {
    if (!started || timeLeft <= 0 || submitting || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, submitting, result]);

  const handleAutoSubmit = async () => {
     await submitQuiz(answers);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const startQuiz = async () => {
     setStarting(true);
     setError("");
     try {
       const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}/start`, {
         method: "POST"
       });
       const data = await res.json();
       
       if (!res.ok) throw new Error(data.error || "Failed to start quiz attempt");

       if (data.activeAttemptStartTime) {
         const startTime = new Date(data.activeAttemptStartTime).getTime();
         const now = new Date().getTime();
         const elapsedSeconds = Math.floor((now - startTime) / 1000);
         
         const timeLimitSeconds = quizConfig.timeLimit * 60;
         const remaining = Math.max(0, timeLimitSeconds - elapsedSeconds);
         
         setTimeLeft(remaining);
       } else {
         setTimeLeft(quizConfig.timeLimit * 60);
       }

       setStarted(true);
     } catch (err: any) {
       setError(err.message);
     } finally {
       setStarting(false);
     }
  };

  const submitQuiz = async (finalAnswers: Record<string, number>) => {
    setSubmitting(true);
    setError("");

    try {
      const timeSpent = quizConfig.timeLimit * 60 - timeLeft;
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, timeSpent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quiz");

      setResult({ grade: data.grade, attemptsRemaining: data.attemptsRemaining });

      // fire off the final xAPI score if we have user info
      if (moduleId && studentId && studentName && studentEmail) {
        fetch('/api/lrs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             actor: {
                name: studentName,
                account: { homePage: "http://ece1724.local", name: studentId }
             },
             verb: {
                id: "http://adlnet.gov/expapi/verbs/completed",
                display: { "en-US": "completed" }
             },
             object: {
                id: `http://ece1724.local/course/${courseId}/module/${moduleId}`
             },
             result: {
                score: {
                   scaled: data.grade / 100,
                   raw: data.grade,
                   min: 0,
                   max: 100
                },
                success: data.grade >= 50,
                duration: `PT${timeSpent}S`
             },
             timestamp: new Date().toISOString()
          })
        }).catch(e => console.warn("xAPI Completion Error:", e));
      }

      router.refresh(); // pull fresh submission state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white p-6 border rounded-xl shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-4xl font-black text-blue-600 mb-4">{result.grade.toFixed(1)}%</p>
        <p className="text-gray-600 mb-6">You have {result.attemptsRemaining} attempts remaining.</p>
        <button onClick={() => window.location.reload()} className={buttonGrey}>View Current State</button>
      </div>
    );
  }

  if (attemptsRemainingInitial <= 0) {
    return (
      <div className="bg-white p-6 border border-red-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-red-600 mb-2">No Attempts Remaining</h2>
        <p className="text-gray-600 mb-2">You have exhausted all {quizConfig.maxAttempts} attempts for this quiz.</p>
        {existingSubmission && (
          <p className="font-semibold">Your Best Grade: {Number(existingSubmission.submissionGrade).toFixed(1)}%</p>
        )}
      </div>
    );
  }

  if (isPastDue && !started) {
    return (
      <div className="bg-white p-6 border border-red-200 rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Quiz Deadline Passed</h2>
        <p className="text-gray-600 mb-4 font-medium">The deadline for this quiz was {new Date(dueDateParam!).toLocaleString()}. You can no longer start new attempts.</p>
        {existingSubmission && (
          <p className="font-bold text-slate-800 px-4 py-2 bg-slate-100 rounded-lg">Your Best Grade: {Number(existingSubmission.submissionGrade).toFixed(1)}%</p>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="bg-white p-6 border rounded-xl shadow-sm text-center space-y-4">
        <h2 className="text-xl font-bold">Ready to take the quiz?</h2>
        {dueDateParam && (
           <p className="text-sm font-semibold text-red-600">Due: {new Date(dueDateParam).toLocaleString()}</p>
        )}
        <div className="flex justify-center gap-6 text-sm text-gray-600">
           <div><span className="font-bold">{quizConfig.questions.length}</span> Questions</div>
           <div><span className="font-bold">{quizConfig.timeLimit}</span> Minutes</div>
           <div><span className="font-bold">{attemptsRemainingInitial}</span> Attempts Left</div>
        </div>
        {existingSubmission && existingSubmission.quizState && (
           <p className="text-gray-500 text-sm italic mt-2">Previous Best Grade: {Number(existingSubmission.submissionGrade).toFixed(1)}%</p>
        )}
        <button 
           onClick={startQuiz} 
           disabled={starting}
           className={buttonBlueIndigo + " w-full max-w-xs mt-4 " + (starting ? "opacity-50 cursor-not-allowed" : "")}
        >
           {starting ? "Starting..." : (existingSubmission?.quizState?.activeAttemptStartTime ? "Resume Attempt" : "Start Attempt")}
        </button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-50 border rounded-xl shadow-sm p-6 relative">
      {started && !result && moduleId && studentId && studentName && studentEmail && (
        <QuizTracker 
          courseId={courseId} 
          moduleId={moduleId} 
          studentId={studentId} 
          studentName={studentName} 
          studentEmail={studentEmail} 
        />
      )}
      
      <div className="sticky top-4 bg-white border shadow-md rounded-full px-6 py-2 w-max mx-auto mb-6 flex items-center gap-2 font-mono font-bold text-lg z-10">
        <span className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-700"}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm font-medium border border-red-200">{error}</div>}

      <div className="space-y-8">
        {quizConfig.questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-medium text-lg mb-4"><span className="text-slate-400 mr-2">{index + 1}.</span> {q.text}</h3>
            <div className="space-y-2 pl-6">
              {q.options.map((opt, optIndex) => (
                <label key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === optIndex ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={optIndex}
                    checked={answers[q.id] === optIndex}
                    onChange={() => handleSelectOption(q.id, optIndex)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t flex justify-end">
         <button 
            onClick={() => submitQuiz(answers)} 
            disabled={submitting}
            className={buttonBlueIndigo + " w-full md:w-auto px-12 " + (submitting ? "opacity-50 cursor-not-allowed" : "")}
         >
           {submitting ? "Evaluating..." : "Submit Quiz"}
         </button>
      </div>
    </div>
  );
}
