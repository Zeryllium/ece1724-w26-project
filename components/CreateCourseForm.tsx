"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {buttonBlueIndigo} from "@/lib/ui";

export default function CreateCourseForm() {
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseName, courseDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create course");
      }

      const newCourse = await res.json();
      
      window.location.href = `/courses/${newCourse.courseId}`;

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Create a New Course</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="space-y-2">
        <label htmlFor="courseName" className="block text-sm font-medium">
          Course Name <span className="text-red-500">*</span>
        </label>
        <input
          id="courseName"
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 text-black"
          placeholder="e.g. Introduction to Algorithms"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="courseDescription" className="block text-sm font-medium">
          Course Description
        </label>
        <textarea
          id="courseDescription"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-black"
          rows={3}
          placeholder="What will students learn?"
        />
      </div>

      <button id="submit-course-btn" type="submit" disabled={loading} className={buttonBlueIndigo + " w-full " + (loading ? "opacity-50" : "")}>
        {loading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}
