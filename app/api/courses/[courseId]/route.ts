import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {auth, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the course exists first
    const course = await prisma.course.findUnique({
      where: { courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify that the user is allowed to modify this course. They should be the managing instructor or an admin.
    const role = (session.user as any).role;

    if (!await isManaging(session.user.id, courseId) && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Handle the incoming update payload
    const body = await request.json();
    const { courseName, courseDescription } = body;

    // Nothing to update
    if (courseName === undefined && courseDescription === undefined) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const parentUpdateData: any = {};
    if (courseName !== undefined) {
      if (typeof courseName !== "string" || courseName.trim() === "") {
        return NextResponse.json({ error: "courseName must be a non-empty string" }, { status: 400 });
      }
      parentUpdateData.courseName = courseName.trim();
    }
    if (courseDescription !== undefined) {
      parentUpdateData.courseDescription = typeof courseDescription === "string" ? courseDescription.trim() : null;
    }

    // Save updates to the database
    const updatedCourse = await prisma.course.update({
      where: { courseId },
      data: parentUpdateData,
    });

    const serializedCourse = {
      ...updatedCourse,
      totalEnrolled: Number(updatedCourse.totalEnrolled),
      totalCompleted: Number(updatedCourse.totalCompleted),
    };
    return NextResponse.json(serializedCourse);

  } catch (error) {
    console.error("Failed to update course:", error);
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
    // Verify the course exists ahead of deletion
    const course = await prisma.course.findUnique({
      where: { courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify that the user is allowed to delete this course. They should be the managing instructor or an admin.
    const role = (session.user as any).role;

    if (!await isManaging(session.user.id, courseId) && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Since our database schema doesn't currently use native cascading deletes for these relationships, we need to manually clean up connecting records through a transaction. This prevents orphaned data in the database.
    await prisma.$transaction([
      prisma.managing.deleteMany({ where: { courseId } }),
      prisma.enrollment.deleteMany({ where: { courseId } }),
      prisma.comment.deleteMany({ where: { courseId } }),
      prisma.module.deleteMany({ where: { courseId } }),
      prisma.course.delete({ where: { courseId } }),
    ]);

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Failed to delete course:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
