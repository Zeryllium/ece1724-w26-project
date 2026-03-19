import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {auth, isManaging, ROLES} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizConfigSchema } from "@/lib/quiz-schema";

export async function PUT(request: NextRequest, props: { params: Promise<{ courseId: string, moduleIndex: string }> }) {
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

  try {
    // Verify the user has permission to modify this module
    const role = (session.user as any).role;
    const _isManaging = await isManaging(session.user.id, courseId);

    if (!_isManaging && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Find the module we want to update
    const targetModule = await prisma.module.findFirst({
      where: { courseId, moduleIndex: index },
    });

    if (!targetModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Sanitize and prepare the update payload
    const body = await request.json();
    const { moduleTitle, moduleDescription, moduleType, moduleResourceUri, quizConfig, assignmentConfig } = body;
    
    const updateData: any = {};
    if (moduleTitle !== undefined) {
      if (typeof moduleTitle !== "string" || moduleTitle.trim() === "") {
        return NextResponse.json({ error: "moduleTitle must be a non-empty string" }, { status: 400 });
      }
      updateData.moduleTitle = moduleTitle.trim();
    }
    if (moduleType !== undefined) {
      if (!["LECTURE", "ASSIGNMENT", "QUIZ"].includes(moduleType)) {
         return NextResponse.json({ error: "moduleType must be LECTURE, ASSIGNMENT, or QUIZ" }, { status: 400 });
      }
      updateData.moduleType = moduleType;
    }
    if (moduleResourceUri !== undefined) {
      if (typeof moduleResourceUri !== "string") {
        return NextResponse.json({ error: "moduleResourceUri must be a string" }, { status: 400 });
      }
      const typeToCheck = moduleType ?? targetModule.moduleType;
      if (moduleResourceUri.trim() !== "") {
          updateData.moduleResources = {
             create: [{
               s3Path: moduleResourceUri.trim(),
               originalName: moduleResourceUri.trim().split('-').pop() || 'resource',
               mimeType: moduleResourceUri.trim().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
               size: 0,
               uploaderId: session.user.id
             }]
          };
      }
    }
    if (moduleDescription !== undefined) {
      updateData.moduleDescription = typeof moduleDescription === "string" ? moduleDescription.trim() : "";
    }
    if (quizConfig !== undefined) {
       const parsedConfig = QuizConfigSchema.safeParse(quizConfig);
       if (!parsedConfig.success) {
          return NextResponse.json({ error: "Invalid quiz configuration payload", details: parsedConfig.error.flatten() }, { status: 400 })
       }
       updateData.quizConfig = JSON.parse(JSON.stringify(parsedConfig.data));
    }
    if (assignmentConfig !== undefined) {
      if (typeof assignmentConfig !== "object" || !assignmentConfig.dueDate) {
        return NextResponse.json({ error: "Invalid assignment configuration payload" }, { status: 400 });
      }
      updateData.assignmentConfig = JSON.parse(JSON.stringify(assignmentConfig));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided to update" }, { status: 400 });
    }

    const updatedModule = await prisma.module.update({
      where: { moduleId: targetModule.moduleId },
      data: updateData,
    });

    return NextResponse.json(updatedModule);

  } catch (error) {
    console.error("Failed to update module:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ courseId: string, moduleIndex: string }> }) {
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

  try {
    // Verify the user has permission to delete this module
    const role = (session.user as any).role;
    const _isManaging = await isManaging(session.user.id, courseId);

    if (!_isManaging && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: You do not manage this course" }, { status: 403 });
    }

    // Find the specific module being requested
    const targetModule = await prisma.module.findFirst({
      where: { courseId, moduleIndex: index },
    });

    if (!targetModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // When we delete a module, it creates a gap in our module numbering. To fix this, we'll wrap the deletion in a transaction that also shifts the index of all subsequent modules down by 1.
    await prisma.$transaction(async (tx) => {
      // First delete associated submissions for this module specifically
      await tx.submission.deleteMany({
        where: { moduleId: targetModule.moduleId }
      });
      
      // Delete the module
      await tx.module.delete({
        where: { moduleId: targetModule.moduleId }
      });

      // Find tracking modules and decrement their index by 1
      await tx.module.updateMany({
        where: {
          courseId: courseId,
          moduleIndex: { gt: index }
        },
        data: {
          moduleIndex: { decrement: 1 }
        }
      });
    });

    return NextResponse.json({ message: "Module deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Failed to delete module:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
