import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";



export async function POST(request: NextRequest) {
  // Create a new course
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user is an instructor (or admin)
  const role = (session.user as any).role;
  if (role !== ROLES.INSTRUCTOR && role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Instructors only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { courseName, courseDescription } = body;

    // Input validation & sanitization
    if (!courseName || typeof courseName !== "string" || courseName.trim() === "") {
      return NextResponse.json({ error: "courseName is required and must be a string" }, { status: 400 });
    }

    const sanitizedName = courseName.trim();
    const sanitizedDescription = typeof courseDescription === "string" ? courseDescription.trim() : null;

    // Create the course and the managing relationship in a transaction
    const newCourse = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          courseName: sanitizedName,
          courseDescription: sanitizedDescription,
        },
      });

      await tx.managing.create({
        data: {
          instructorId: session.user.id,
          courseId: course.courseId,
        },
      });

      return course;
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Failed to create course:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
