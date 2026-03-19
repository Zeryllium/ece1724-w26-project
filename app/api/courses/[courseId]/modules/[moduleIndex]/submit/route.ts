import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuizConfig } from "@/lib/quiz-schema";
import { GoogleGenAI } from "@google/genai";
import path from "path";

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
  
      if (!targetModule) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
  
      if (targetModule.moduleType === "ASSIGNMENT") {
        const assignmentConfig = targetModule.assignmentConfig as any;
        if (assignmentConfig?.dueDate && new Date() > new Date(assignmentConfig.dueDate)) {
           return NextResponse.json({ error: "The deadline for this assignment has passed." }, { status: 403 });
        }

        const body = await request.json();
        const { assignmentFileUrl } = body;
        
        if (!assignmentFileUrl) {
          return NextResponse.json({ error: "No assignment file URL provided" }, { status: 400 });
        }
  
        const submittedAt = new Date().toISOString();
        
        let finalGrade = 0;
        let finalStatus: "INCOMPLETE" | "PASS" | "FAIL" = "INCOMPLETE";
        let instructorFeedback = null;

        // Perform AI Grading if enabled
        if (assignmentConfig?.aiGradingEnabled) {
           try {
              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
              const physicalPath = path.join(process.cwd(), "public", assignmentFileUrl);

              const uploadRes = await ai.files.upload({ file: physicalPath, config: { mimeType: 'application/pdf' } });
              
              const prompt = `You are an expert grading assistant. Review the attached assignment submission. \n\nRubric/Criteria:\n${assignmentConfig.aiRubric || "Standard evaluation."}\n\nStrictness Level:\n${assignmentConfig.aiDifficulty || "standard"}\n\nPlease grade this from 0 to 100 and provide constructive feedback for the student in the exact requested JSON format.`;

              const result = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: [{
                    role: "user",
                    parts: [
                      { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType || 'application/pdf' } },
                      { text: prompt }
                    ]
                  }],
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: 'OBJECT',
                      properties: {
                        grade: { type: 'NUMBER' },
                        feedback: { type: 'STRING' }
                      },
                      required: ['grade', 'feedback']
                    }
                  }
              });

              const parsedContent = JSON.parse(result.text || "{}");
              if (parsedContent.grade !== undefined) {
                 finalGrade = parsedContent.grade;
                 finalStatus = finalGrade >= 50 ? "PASS" : "FAIL";
                 instructorFeedback = parsedContent.feedback || "Graded by AI without feedback.";
              }
           } catch (err: any) {
              console.error("AI Grading failed:", err);
              // Fallback to incomplete if AI breaks
              instructorFeedback = "AI Autograder failed to process this document. An instructor will review it manually.";
           }
        }
        
        await prisma.submission.upsert({
          where: {
            studentId_moduleId: {
              studentId: session.user.id,
              moduleId: targetModule.moduleId,
            }
          },
          update: {
            submissionGrade: finalGrade,
            submissionStatus: finalStatus,
            assignmentState: {
              fileUrl: assignmentFileUrl,
              submittedAt,
              instructorFeedback
            },
            files: {
               create: [{
                  s3Path: assignmentFileUrl,
                  originalName: assignmentFileUrl.split('-').pop() || 'submission.pdf',
                  mimeType: 'application/pdf',
                  size: 0,
                  uploaderId: session.user.id
               }]
            }
          },
          create: {
            studentId: session.user.id,
            moduleId: targetModule.moduleId,
            submissionGrade: finalGrade,
            submissionStatus: finalStatus,
            assignmentState: {
              fileUrl: assignmentFileUrl,
              submittedAt,
              instructorFeedback
            },
            files: {
               create: [{
                  s3Path: assignmentFileUrl,
                  originalName: assignmentFileUrl.split('-').pop() || 'submission.pdf',
                  mimeType: 'application/pdf',
                  size: 0,
                  uploaderId: session.user.id
               }]
            }
          }
        });

        // Delete the temporary file from the File API if necessary in future, but not strictly required since they auto-expire.
  
        return NextResponse.json({ message: "Assignment submitted successfully" }, { status: 200 });
  
      } else if (targetModule.moduleType === "QUIZ") {
        if (!targetModule.quizConfig) {
          return NextResponse.json({ error: "Quiz configuration missing" }, { status: 404 });
        }
        const quizConfig = targetModule.quizConfig as unknown as QuizConfig;
        const body = await request.json();
        const { answers, timeSpent } = body;
  
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
        const isPass = grade >= 50;
  
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
  
      } else {
        return NextResponse.json({ error: "Module type does not accept submissions" }, { status: 400 });
      }
  
    } catch (error) {
      console.error("Failed to evaluate module:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
