"use client";

import { useTransition } from "react";
import { enrollInCourse } from "@/app/actions/enroll";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        await enrollInCourse(courseId);
      } catch (err) {
        console.error("Failed to enroll", err);
      }
    });
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isPending}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full md:w-auto"
    >
      {isPending ? "Enrolling..." : "Enroll Now"}
    </button>
  );
}
