"use client";

import { useState } from "react";
import EditModuleForm from "./EditModuleForm";
import { Button } from "./ui/button";

export default function ModuleEditorWrapper({ courseId, moduleIndex, initialData, children }: any) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="mt-6">
        <EditModuleForm 
           courseId={courseId} 
           moduleIndex={moduleIndex} 
           initialData={initialData} 
           onCancel={() => setIsEditing(false)} 
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mt-8">
        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Module Settings</Button>
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
