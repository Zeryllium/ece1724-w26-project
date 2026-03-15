"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateModuleForm({ courseId }: { courseId: string }) {
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleType, setModuleType] = useState("LECTURE");
  const [moduleResourceUri, setModuleResourceUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
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
        throw new Error(data.error || "Failed to create module");
      }

      // Reset form on success
      setModuleTitle("");
      setModuleDescription("");
      setModuleType("LECTURE");
      setModuleResourceUri("");
      
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border p-6 rounded-lg shadow-sm space-y-4 max-w-xl bg-white">
      <h2 className="text-xl font-semibold">Add a New Module</h2>
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
          placeholder="e.g. Week 1: Introduction"
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
          placeholder="https://example.com/video.mp4"
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
          rows={2}
          placeholder="Optional outline or notes for this module"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add Module"}
      </Button>
    </form>
  );
}
