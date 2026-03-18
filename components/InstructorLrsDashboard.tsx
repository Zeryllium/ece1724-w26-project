"use client";

import { useEffect, useState } from "react";
import { textH2Style } from "@/lib/ui";
import { RxBarChart, RxClock, RxCursorArrow } from "react-icons/rx";

export default function InstructorLrsDashboard({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalStarts: 0,
    totalCompletions: 0,
    averageTimeSeconds: 0,
    averageTabSwitches: 0
  });

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetch(`/api/lrs?courseId=${courseId}&moduleId=${moduleId}`);
        if (!res.ok) throw new Error("Failed to fetch LRS telemetry");
        
        const data = await res.json();
        calculateMetrics(data.statements || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTelemetry();
  }, [courseId, moduleId]);

  const calculateMetrics = (statements: any[]) => {
    let initializedCount = 0;
    let completedCount = 0;
    let suspendedCount = 0;
    let totalTimeMilli = 0;
    let completedWithDurationCount = 0;

    // We can group statements by Actor to get averages per student, 
    // but for a simple aggregate dashboard we just count totals and divide.
    const uniqueActors = new Set();

    statements.forEach((stmt: any) => {
      const verbId = stmt.verb?.id;
      const actorId = stmt.actor?.account?.name || stmt.actor?.mbox;
      
      if (actorId) uniqueActors.add(actorId);

      if (verbId === "http://adlnet.gov/expapi/verbs/initialized") {
        initializedCount++;
      } else if (verbId === "http://adlnet.gov/expapi/verbs/suspended") {
        suspendedCount++;
      } else if (verbId === "http://adlnet.gov/expapi/verbs/completed") {
        completedCount++;
        // Parse ISO 8601 Duration (e.g. PT120S)
        const durationStr = stmt.result?.duration;
        if (durationStr && durationStr.startsWith("PT") && durationStr.endsWith("S")) {
           const seconds = parseInt(durationStr.replace("PT", "").replace("S", ""));
           if (!isNaN(seconds)) {
              totalTimeMilli += (seconds * 1000);
              completedWithDurationCount++;
           }
        }
      }
    });

    const activeStudents = uniqueActors.size || 1; // avoid div by 0

    setMetrics({
      totalStarts: initializedCount,
      totalCompletions: completedCount,
      averageTimeSeconds: completedWithDurationCount > 0 ? (totalTimeMilli / completedWithDurationCount) / 1000 : 0,
      averageTabSwitches: suspendedCount / activeStudents
    });
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (loading) return <div className="text-sm text-slate-500 animate-pulse mt-8">Loading Advanced Telemetry...</div>;
  if (error) return <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200 mt-8">LRS Telemetry sync failed: {error}</div>;

  return (
    <div className="bg-white p-8 border rounded-xl shadow-sm mt-8">
      <h2 className={textH2Style + " mb-6 flex items-center gap-2"}>
        <RxBarChart className="text-blue-600"/> 
        Behavioral Analytics (Veracity LRS)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-900 pointer-events-none">
             <RxCursorArrow size={100}/>
           </div>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">Total Starts</p>
           <p className="text-3xl font-extrabold text-blue-600 relative z-10">{metrics.totalStarts}</p>
        </div>

        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Completions</p>
           <p className="text-3xl font-extrabold text-indigo-600 relative z-10">{metrics.totalCompletions}</p>
        </div>

        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 inline-flex items-center gap-1">
             <RxClock/> Avg Duration
           </p>
           <p className="text-3xl font-extrabold text-emerald-600">{formatTime(metrics.averageTimeSeconds)}</p>
        </div>

        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50 shadow-sm">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Tab Switches</p>
           <p className="text-3xl font-extrabold text-rose-600">{metrics.averageTabSwitches.toFixed(1)}</p>
        </div>

      </div>
      <p className="text-xs text-slate-400 mt-6 text-right">Data securely provided by Veracity Learning API</p>
    </div>
  );
}
