import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizConfig } from "@/lib/quiz-schema";

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
      return NextResponse.json({ error: "Quiz not found or invalid module type" }, { status: 404 });
    }

    const quizConfig = targetModule.quizConfig as unknown as QuizConfig;
    const body = await request.json();
    const { answers, timeSpent } = body; // answers: Record<string, number> (questionId -> optionIndex)

    if (!answers || typeof answers !== "object") {
       return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
    }

    // Evaluate the quiz
    let correctCount = 0;
    const totalQuestions = quizConfig.questions.length;

    quizConfig.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const grade = (correctCount / totalQuestions) * 100;
    const isPass = grade >= 50; // simple passing threshold of 50%

    // Check existing submission to calculate attempts
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

    const newAttemptsCount = currentAttempts + 1;
    
    // We update or create the submission with the new highest grade and incremented attempts
    const previousGrade = existingSubmission ? Number(existingSubmission.submissionGrade) : 0;
    const bestGrade = Math.max(previousGrade, grade);

    const submission = await prisma.submission.upsert({
      where: {
        studentId_moduleId: {
          studentId: session.user.id,
          moduleId: targetModule.moduleId,
        }
      },
      update: {
        submissionGrade: bestGrade,
        submissionStatus: bestGrade >= 50 ? "PASS" : "FAIL",
        quizState: {
          attempts: newAttemptsCount,
          lastAnswers: answers,
          lastTimeSpent: timeSpent,
          latestGrade: grade,
          activeAttemptStartTime: null
        }
      },
      create: {
        studentId: session.user.id,
        moduleId: targetModule.moduleId,
        submissionGrade: grade,
        submissionStatus: isPass ? "PASS" : "FAIL",
        quizState: {
          attempts: 1,
          lastAnswers: answers,
          lastTimeSpent: timeSpent,
          latestGrade: grade,
          activeAttemptStartTime: null
        }
      }
    });

    return NextResponse.json({ 
        message: "Quiz evaluated successfully", 
        grade, 
        isPass,
        attemptsRemaining: quizConfig.maxAttempts - newAttemptsCount
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to evaluate quiz:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
