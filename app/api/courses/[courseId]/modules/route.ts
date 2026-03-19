import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {auth, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizConfigSchema } from "@/lib/quiz-schema";

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the user is authorized to add modules (needs to be an instructor or admin)
    const role = (session.user as any).role;

    if (!await isManaging(session.user.id, courseId) && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Grab the module details from the request body
    const body = await request.json();
    const { moduleTitle, moduleDescription, moduleType, moduleResourceUri, quizConfig, assignmentConfig } = body;

    if (!moduleTitle || typeof moduleTitle !== "string" || moduleTitle.trim() === "") {
      return NextResponse.json({ error: "moduleTitle is required" }, { status: 400 });
    }
    if (!moduleType || !["LECTURE", "ASSIGNMENT", "QUIZ"].includes(moduleType)) {
      return NextResponse.json({ error: "moduleType must be LECTURE, ASSIGNMENT, or QUIZ" }, { status: 400 });
    }
    // We bypass the resource uri check if the module is a quiz!
    if (moduleType !== "QUIZ" && (!moduleResourceUri || typeof moduleResourceUri !== "string" || moduleResourceUri.trim() === "")) {
      return NextResponse.json({ error: "moduleResourceUri is required for non-quiz modules" }, { status: 400 });
    }

    let validQuizConfig = null;
    if (moduleType === "QUIZ") {
      const parsedConfig = QuizConfigSchema.safeParse(quizConfig);
      if (!parsedConfig.success) {
         return NextResponse.json({ error: "Invalid quiz configuration payload", details: parsedConfig.error.flatten() }, { status: 400 })
      }
      validQuizConfig = parsedConfig.data;
    }

    let validAssignmentConfig = null;
    if (moduleType === "ASSIGNMENT" && assignmentConfig) {
      if (typeof assignmentConfig !== "object" || !assignmentConfig.dueDate) {
        return NextResponse.json({ error: "Invalid assignment configuration payload" }, { status: 400 });
      }
      validAssignmentConfig = assignmentConfig;
    }

    const sanitizedTitle = moduleTitle.trim();
    const sanitizedDescription = typeof moduleDescription === "string" ? moduleDescription.trim() : "";
    const sanitizedUri = moduleResourceUri ? moduleResourceUri.trim() : "";

    // We need to assign a sequential index to the new module. We'll find the highest current index and just add 1. Doing this inside a transaction keeps it safe from race conditions.
    const newModule = await prisma.$transaction(async (tx) => {
      // Find the highest current index for this course
      const maxModule = await tx.module.findFirst({
        where: { courseId },
        orderBy: { moduleIndex: "desc" },
        select: { moduleIndex: true },
      });

      const nextIndex = maxModule ? maxModule.moduleIndex + 1 : 1;

      return await tx.module.create({
        data: {
          courseId: courseId,
          moduleIndex: nextIndex,
          moduleTitle: sanitizedTitle,
          moduleDescription: sanitizedDescription,
          moduleType: moduleType as "LECTURE" | "ASSIGNMENT" | "QUIZ",
          moduleResources: sanitizedUri ? {
            create: [{
              s3Path: sanitizedUri,
              originalName: sanitizedUri.split('-').pop() || 'resource',
              mimeType: sanitizedUri.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
              size: 0,
              uploaderId: session.user.id
            }]
          } : undefined,
          quizConfig: validQuizConfig ? JSON.parse(JSON.stringify(validQuizConfig)) : null,
          assignmentConfig: validAssignmentConfig ? JSON.parse(JSON.stringify(validAssignmentConfig)) : null,
        },
      });
    });

    return NextResponse.json(newModule, { status: 201 });

  } catch (error) {
    console.error("Failed to create module:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
