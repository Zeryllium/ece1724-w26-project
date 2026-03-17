"use client";

import { useState } from "react";
import DeleteCourseButton from "./DeleteCourseButton";
import EditCourseForm from "./EditCourseForm";
import {buttonBaseStyling, buttonGrey} from "@/lib/ui";

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
        className={`${buttonBaseStyling} ${buttonGrey}`}
      >
        Edit Course
      </button>
      <DeleteCourseButton courseId={courseId} courseName={courseName} />
    </div>
  );
}