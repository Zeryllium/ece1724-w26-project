"use client";

import { useState } from "react";
import EditModuleForm from "./EditModuleForm";
import { buttonGrey } from "@/lib/ui";

export default function ModuleEditorWrapper({ courseId, moduleIndex, initialData, headerLeft, children }: any) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        {headerLeft}
        {!isEditing && (
          <div className="mt-2 text-right">
            <button className={buttonGrey} onClick={() => setIsEditing(true)}>
              Edit Module Settings
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="w-full">
          <EditModuleForm 
             courseId={courseId} 
             moduleIndex={moduleIndex} 
             initialData={initialData} 
             onCancel={() => setIsEditing(false)} 
          />
        </div>
      ) : (
        children
      )}
    </>
  );
}
