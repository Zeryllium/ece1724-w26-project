"use client";

import CreateModuleForm from "./CreateModuleForm";

export default function CreateModuleWrapper({ courseId }: any) {
  return (
    <div className="mt-6">
      <CreateModuleForm
        courseId={courseId}
      />
    </div>
  );
}
