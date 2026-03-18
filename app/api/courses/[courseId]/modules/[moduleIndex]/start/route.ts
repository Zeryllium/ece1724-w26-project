import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, props: { params: Promise<{ courseId: string; moduleIndex: string }> }) {
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
    const targetModule = await prisma.module.findFirst({
      where: { courseId, moduleIndex: index },
    });

    if (!targetModule || targetModule.moduleType !== "QUIZ" || !targetModule.quizConfig) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quizConfig = targetModule.quizConfig as any;

    // Check existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_moduleId: {
          studentId: session.user.id,
          moduleId: targetModule.moduleId,
        }
      }
    });

    const currentAttempts = existingSubmission?.quizState 
        ? (existingSubmission.quizState as any).attempts || 0 
        : 0;

    if (currentAttempts >= quizConfig.maxAttempts) {
       return NextResponse.json({ error: "Maximum attempts reached" }, { status: 403 });
    }

    // Check if there is an active valid attempt
    let activeStartTime = null;
    if (existingSubmission?.quizState) {
        const state = existingSubmission.quizState as any;
        if (state.activeAttemptStartTime) {
            // Check if timer expired
            const startTime = new Date(state.activeAttemptStartTime).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const limitSeconds = quizConfig.timeLimit * 60;
            
            // Allow a 10 second grace period for network latency on auto-submission
            if (elapsedSeconds <= limitSeconds + 10) {
               activeStartTime = state.activeAttemptStartTime;
            }
        }
    }

    // If no active attempt or it expired (they abandoned it), start a new one
    if (!activeStartTime) {
        activeStartTime = new Date().toISOString();
        
        await prisma.submission.upsert({
            where: {
              studentId_moduleId: {
                studentId: session.user.id,
                moduleId: targetModule.moduleId,
              }
            },
            update: {
              quizState: {
                ...(existingSubmission?.quizState as any || {}),
                activeAttemptStartTime: activeStartTime
              }
            },
            create: {
              studentId: session.user.id,
              moduleId: targetModule.moduleId,
              submissionGrade: 0,
              submissionStatus: "FAIL",
              quizState: {
                attempts: 0, // Not counting it as an attempt until submitted
                activeAttemptStartTime: activeStartTime
              }
            }
        });
    }

    return NextResponse.json({ 
        message: "Attempt initialized", 
        activeAttemptStartTime: activeStartTime
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to initialize quiz attempt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
