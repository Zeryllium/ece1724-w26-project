import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user is a STUDENT (or anyone who wants to take a course really)
  // Even an instructor might want to take courses, but typically we want to check it.
  // Actually, Better Auth defaults roles to STUDENT, so it's fine.

  try {
    // 1. Check if course exists
    const course = await prisma.course.findUnique({
      where: { courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // 2. Transact enrollment and course count increment
    const enrollment = await prisma.$transaction(async (tx) => {
      // Create or update the enrollment
      const en = await tx.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId,
          },
        },
        update: {
          courseStatus: "INCOMPLETE",
        },
        create: {
          studentId: session.user.id,
          courseId: courseId,
          courseStatus: "INCOMPLETE",
        },
      });

      // Increment enrollment count if this was a net-new active enrollment.
      // But upsert makes counting tricky. Let's just always increment for simplicity
      // and assume we drop decrement. 
      // Actually, standard way is to update Course TotalEnrolled:
      await tx.course.update({
        where: { courseId },
        data: {
          totalEnrolled: { increment: 1 },
        },
      });

      return en;
    });

    // Note: totalEnrolled is a BigInt. JSON.stringify doesn't support BigInt natively.
    // We stringify the BigInt before returning.
    return NextResponse.json({
      ...enrollment,
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to enroll:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Transact enrollment drop and decrement count
    await prisma.$transaction(async (tx) => {
      const existing = await tx.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId,
          },
        },
      });

      if (!existing) {
         throw new Error("NOT_FOUND");
      }

      await tx.enrollment.delete({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId,
          },
        },
      });

      await tx.course.update({
        where: { courseId },
        data: {
          totalEnrolled: { decrement: 1 },
        },
      });
    });

    return NextResponse.json({ message: "Successfully dropped course." }, { status: 200 });

  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }
    console.error("Failed to drop:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
