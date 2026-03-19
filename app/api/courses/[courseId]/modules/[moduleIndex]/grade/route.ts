import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, isManaging, ROLES } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, props: { params: Promise<{ courseId: string; moduleIndex: string }> }) {
  const { courseId, moduleIndex } = await props.params;
  const index = parseInt(moduleIndex, 10);

  if (isNaN(index)) {
    return NextResponse.json({ error: "Invalid module index" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role || ROLES.STUDENT;
  const _isManaging = await isManaging(session.user.id, courseId);

  if (!_isManaging && role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Not an instructor for this course" }, { status: 403 });
  }

  try {
    const targetModule = await prisma.module.findFirst({
      where: { courseId, moduleIndex: index },
    });

    if (!targetModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const body = await request.json();
    const { studentId, grade, feedback } = body;

    if (!studentId || grade === undefined) {
      return NextResponse.json({ error: "Missing studentId or grade" }, { status: 400 });
    }

    // Determine status purely on threshold or could be left to instructor logic. Let's use simple >= 50 for pass
    const isPass = Number(grade) >= 50;
    const submissionStatus = isPass ? "PASS" : "FAIL";

    const subRaw = await prisma.submission.findUnique({
      where: { studentId_moduleId: { studentId, moduleId: targetModule.moduleId } }
    });

    const updatedAssignmentState = subRaw?.assignmentState ? { ...(subRaw.assignmentState as any) } : {};
    if (feedback !== undefined) {
      updatedAssignmentState.instructorFeedback = feedback;
    }

    const submission = await prisma.submission.update({
      where: {
        studentId_moduleId: {
          studentId,
          moduleId: targetModule.moduleId,
        }
      },
      data: {
        submissionGrade: Number(grade),
        submissionStatus,
        assignmentState: updatedAssignmentState
      }
    });

    return NextResponse.json({ message: "Grade updated successfully", submission }, { status: 200 });

  } catch (error) {
    console.error("Failed to update grade:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
