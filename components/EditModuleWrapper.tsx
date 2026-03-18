"use client";

import EditModuleForm from "./EditModuleForm";

export default function EditModuleWrapper({ courseId, moduleIndex, initialData }: any) {
  return (
    <div className="mt-6">
      <EditModuleForm
         courseId={courseId}
         moduleIndex={moduleIndex}
         initialData={initialData}
         onCancel={()=> {}}
      />
    </div>
  );
}
