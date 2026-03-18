"use client";

import { useEffect, useRef } from 'react';

// helper to grab the current UTC time for xAPI
const getTimestamp = () => new Date().toISOString();

// fires off a statement to our local LRS proxy route
const dispatchStatement = async (statement: any) => {
  try {
    await fetch('/api/lrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statement)
    });
  } catch (error) {
    console.warn("xAPI Telemetry Error:", error);
  }
};

export default function QuizTracker({ 
  courseId, 
  moduleId, 
  studentId, 
  studentName, 
  studentEmail 
}: { 
  courseId: string; 
  moduleId: string; 
  studentId: string;
  studentName: string;
  studentEmail: string;
}) {
  const hasInitialized = useRef(false);

  // what URI represents this unique quiz?
  const activityId = `http://ece1724.local/course/${courseId}/module/${moduleId}`;
  
  // core student info for the xAPI tracking
  const actor = {
    name: studentName,
    account: {
       homePage: "http://ece1724.local",
       name: studentId
    }
  };

  useEffect(() => {
    // register that the user started the quiz
    if (!hasInitialized.current) {
       hasInitialized.current = true;
       dispatchStatement({
         actor,
         verb: {
           id: "http://adlnet.gov/expapi/verbs/initialized",
           display: { "en-US": "initialized" }
         },
         object: {
           id: activityId,
           definition: {
             type: "http://adlnet.gov/expapi/activities/assessment",
             name: { "en-US": `Quiz Module ${moduleId}` }
           }
         },
         timestamp: getTimestamp()
       });
    }

    // watch for users tabbing away or minimizing the browser
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // lost visibility
        dispatchStatement({
          actor,
          verb: {
            id: "http://adlnet.gov/expapi/verbs/suspended",
            display: { "en-US": "suspended" }
          },
          object: { id: activityId },
          timestamp: getTimestamp()
        });
      } else {
        // got visibility back
        dispatchStatement({
          actor,
          verb: {
            id: "http://adlnet.gov/expapi/verbs/resumed",
            display: { "en-US": "resumed" }
          },
          object: { id: activityId },
          timestamp: getTimestamp()
        });
      }
    };

    const handleBlur = () => {
       // catch clicking off screen/devtools/etc
       dispatchStatement({
          actor,
          verb: {
            id: "http://adlnet.gov/expapi/verbs/suspended",
            display: { "en-US": "suspended focus" }
          },
          object: { id: activityId },
          timestamp: getTimestamp()
       });
    };

    const handleFocus = () => {
       dispatchStatement({
          actor,
          verb: {
            id: "http://adlnet.gov/expapi/verbs/resumed",
            display: { "en-US": "resumed focus" }
          },
          object: { id: activityId },
          timestamp: getTimestamp()
       });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
       document.removeEventListener("visibilitychange", handleVisibilityChange);
       window.removeEventListener("blur", handleBlur);
       window.removeEventListener("focus", handleFocus);
    };
  }, [courseId, moduleId, studentId, studentName, studentEmail, activityId]);

  // component has no UI
  return null;
}
