"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {buttonBaseStyling, buttonRed} from "@/lib/ui";

export default function DeleteCourseButton({ courseId, courseName }: { courseId: string, courseName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to completely delete "${courseName}" and all its modules? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete course");
      }

      router.push("/courses");
      router.refresh();
      
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`${buttonBaseStyling} ${buttonRed}`}
    >
      {loading ? "Deleting..." : "Delete Course"}
    </button>
  );
}
