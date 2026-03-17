"use client";

import { useTransition } from "react";
import { enrollInCourse } from "@/app/actions/enroll";
import {buttonBaseStyling, buttonBlueIndigo} from "@/lib/ui";

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
      className={`${buttonBaseStyling} ${buttonBlueIndigo}`}
    >
      {isPending ? "Enrolling..." : "Enroll Now"}
    </button>
  );
}
