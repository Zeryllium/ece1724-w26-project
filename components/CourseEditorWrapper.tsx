"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteCourseButton from "./DeleteCourseButton";
import EditCourseForm from "./EditCourseForm";

interface CourseActionsProps {
  isManaging: boolean;
  courseId: string;
  courseName: string;
  initialName: string;
  initialDescription: string;
}

export default function CourseEditorWrapper({
  isManaging,
  courseId,
  courseName,
  initialName,
  initialDescription,
}: CourseActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isManaging) {
    return null; 
  }

  if (isEditing) {
    return (
      <div className="w-full max-w-md">
        <EditCourseForm
          courseId={courseId}
          initialName={initialName}
          initialDescription={initialDescription}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium bg-white hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700 border border-slate-300 transition inline-block text-center"
      >
        Edit Course
      </button>
      <DeleteCourseButton courseId={courseId} courseName={courseName} />
    </div>
  );
}