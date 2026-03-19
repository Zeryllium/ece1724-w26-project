"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";

interface CalendarEvent {
  date: Date;
  title: string;
  type: string;
  link: string;
}

export default function CourseCalendar({ courseId, modules }: { courseId: string, modules: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const events: CalendarEvent[] = [];
  modules.forEach(mod => {
    if (mod.moduleType === "ASSIGNMENT" && mod.assignmentConfig?.dueDate) {
      events.push({
        date: new Date(mod.assignmentConfig.dueDate),
        title: mod.moduleTitle,
        type: "ASSIGNMENT",
        link: `/courses/${courseId}/module/${mod.moduleIndex}`
      });
    } else if (mod.moduleType === "QUIZ" && mod.quizConfig?.dueDate) {
      events.push({
        date: new Date(mod.quizConfig.dueDate),
        title: mod.moduleTitle,
        type: "QUIZ",
        link: `/courses/${courseId}/module/${mod.moduleIndex}`
      });
    }
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => 
      e.date.getFullYear() === year && 
      e.date.getMonth() === month && 
      e.date.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  if (!mounted) {
    return (
       <div className="bg-white border rounded-xl shadow-sm p-6 w-full mt-12 min-h-[400px] animate-pulse flex items-center justify-center">
          <span className="text-slate-400 font-medium">Loading Course Schedule...</span>
       </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6 w-full mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Course Schedule</h2>
           <p className="text-sm text-slate-500 mt-1">Assignments and quizzes with defined deadlines.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 border rounded-full px-2 py-1 shadow-sm">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><RxChevronLeft size={20} className="text-slate-600"/></button>
          <span className="text-base font-bold w-36 text-center text-slate-700 tracking-wide">{monthNames[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><RxChevronRight size={20} className="text-slate-600"/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="bg-slate-50 p-2 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white min-h-[90px] sm:min-h-[120px] p-2 text-slate-300"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          return (
            <div key={`day-${day}`} className={`bg-white min-h-[90px] sm:min-h-[120px] p-2 border-t border-slate-100 relative group transition-colors hover:bg-slate-50`}>
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1 ${isToday(day) ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-700"}`}>
                {day}
              </span>
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[140px]">
                {dayEvents.map((evt, idx) => (
                  <Link key={idx} href={evt.link} className="block group/link">
                    <div className={`p-1.5 rounded bg-white shadow-sm border transition-all ${
                       evt.type === 'QUIZ' 
                         ? 'border-orange-200 hover:border-orange-500' 
                         : 'border-emerald-200 hover:border-emerald-500'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-0.5">
                        <span className={`w-2 h-2 shrink-0 rounded-full ${evt.type === 'QUIZ' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate">{evt.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs font-medium truncate leading-tight ${evt.type === 'QUIZ' ? 'text-orange-900' : 'text-emerald-900'}`}>
                         {evt.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        
        {Array.from({ length: (42 - (firstDay + daysInMonth)) % 7 }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-white min-h-[90px] sm:min-h-[120px] p-2 text-slate-300"></div>
        ))}
      </div>
    </div>
  );
}
