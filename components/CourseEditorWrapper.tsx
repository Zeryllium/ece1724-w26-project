"use client";

import { useState } from "react";
import EditCourseForm from "./EditCourseForm";
import {buttonBaseStyling, buttonGrey} from "@/lib/ui";

interface CourseActionsProps {
  isManaging: boolean;
  courseId: string;
  initialName: string;
  initialDescription: string;
}

export default function CourseEditorWrapper({
  isManaging,
  courseId,
  initialName,
  initialDescription,
}: CourseActionsProps) {

  if (!isManaging) {
    return null; 
  }

  return (
    <div className="w-full max-w-md">
      <EditCourseForm
        courseId={courseId}
        initialName={initialName}
        initialDescription={initialDescription}
      />
    </div>
  );

}