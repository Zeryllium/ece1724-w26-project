"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function enrollInCourse(courseId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Check if they are already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId
      }
    }
  });

  if (existing) {
    return { success: true };
  }

  // Create enrollment
  await prisma.enrollment.create({
    data: {
      studentId: session.user.id,
      courseId,
      courseStatus: "INCOMPLETE"
    }
  });

  // Increment totalEnrolled
  await prisma.course.update({
    where: { courseId },
    data: {
      totalEnrolled: { increment: 1 }
    }
  });

  revalidatePath("/courses/[courseId]", "page");
  revalidatePath("/courses");
  
  return { success: true };
}
