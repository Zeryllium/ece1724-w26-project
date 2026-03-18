"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EditModuleForm({ 
  courseId, 
  moduleIndex, 
  initialData, 
  onCancel 
}: { 
  courseId: string; 
  moduleIndex: number; 
  initialData: any;
  onCancel: () => void;
}) {
  const [moduleTitle, setModuleTitle] = useState(initialData.moduleTitle || "");
  const [moduleDescription, setModuleDescription] = useState(initialData.moduleDescription || "");
  const [moduleType, setModuleType] = useState(initialData.moduleType || "LECTURE");
  const [moduleResourceUri, setModuleResourceUri] = useState(initialData.moduleResourceUri || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          moduleTitle, 
          moduleDescription, 
          moduleType, 
          moduleResourceUri 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update module");
      }

      router.refresh();
      onCancel(); // Close the form
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Edit Module Details</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="space-y-2">
        <label htmlFor="moduleTitle" className="block text-sm font-medium">
          Module Title <span className="text-red-500">*</span>
        </label>
        <input
          id="moduleTitle"
          type="text"
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 text-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="moduleType" className="block text-sm font-medium">
          Module Type <span className="text-red-500">*</span>
        </label>
        <select
          id="moduleType"
          value={moduleType}
          onChange={(e) => setModuleType(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
        >
          <option value="LECTURE">Lecture (Video/Reading)</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="QUIZ">Quiz</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="moduleResourceUri" className="block text-sm font-medium">
          Resource URL <span className="text-red-500">*</span>
        </label>
        <input
          id="moduleResourceUri"
          type="url"
          value={moduleResourceUri}
          onChange={(e) => setModuleResourceUri(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 text-black"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="moduleDescription" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="moduleDescription"
          value={moduleDescription}
          onChange={(e) => setModuleDescription(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
