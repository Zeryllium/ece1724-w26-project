"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {buttonBaseStyling, buttonRed} from "@/lib/ui";

export default function DeleteModuleButton({ courseId, moduleIndex }: { courseId: string, moduleIndex: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete Module ${moduleIndex}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleIndex}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete module");
      }

      router.refresh(); // Server component will re-fetch data
      
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
      {loading ? "..." : "Delete"}
    </button>
  );
}
