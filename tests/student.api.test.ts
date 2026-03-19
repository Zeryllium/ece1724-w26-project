import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PUT as updateCourse } from '../app/api/courses/[courseId]/route';
import { POST as submitQuiz } from '../app/api/courses/[courseId]/modules/[moduleIndex]/submit/route';
import { enrollInCourse } from '../app/actions/enroll';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { revalidatePath } from 'next/cache';

process.env.GEMINI_API_KEY = "test-key";

// Mock AI
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      files = {
        upload: vi.fn().mockResolvedValue({ uri: 'mock-uri', mimeType: 'application/pdf' })
      };
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({ grade: 85, feedback: 'Great work via AI!' })
        })
      };
    }
  };
});

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
  isManaging: vi.fn().mockResolvedValue(false),
  ROLES: { INSTRUCTOR: 'INSTRUCTOR', STUDENT: 'STUDENT', ADMIN: 'ADMIN' },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: { findUnique: vi.fn(), create: vi.fn() },
    course: { findUnique: vi.fn(), update: vi.fn() },
    managing: { findUnique: vi.fn() },
    module: { findFirst: vi.fn() },
    submission: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

function createMockRequest(body: any) {
  return { json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

describe('Student Enrollment API & Actions', () => {
  const mockStudentSession = { user: { id: 'student-456' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enrollInCourse Server Action', () => {
    it('should successfully enroll a user and increment course views', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.enrollment.create).mockResolvedValueOnce({} as any);
      vi.mocked(prisma.course.update).mockResolvedValueOnce({} as any);

      const res = await enrollInCourse('course-1');

      expect(res.success).toBe(true);
      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: { studentId: 'student-456', courseId: 'course-1', courseStatus: 'INCOMPLETE' }
      });
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        data: { totalEnrolled: { increment: 1 } }
      });
      expect(revalidatePath).toHaveBeenCalledTimes(2);
    });

    it('should return quickly if already enrolled', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValueOnce({ studentId: 'student-456', courseId: 'course-1' } as any);

      const res = await enrollInCourse('course-1');

      expect(res.success).toBe(true);
      expect(prisma.enrollment.create).not.toHaveBeenCalled();
      expect(prisma.course.update).not.toHaveBeenCalled();
    });

    it('should throw an error if unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      await expect(enrollInCourse('course-1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('Restricted Marketplace Boundaries', () => {
    it('PUT /api/courses/[courseId] should reject an enrolled student trying to edit course metadata', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({ courseId: 'course-1' } as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce(null); // They don't manage it!

      const req = createMockRequest({ courseName: 'Hacked Title' });
      const res = await updateCourse(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });
  });

  describe('Quiz Taker Evaluation', () => {
    const mockQuizModule = {
       moduleId: 'm-1',
       moduleType: 'QUIZ',
       quizConfig: {
          timeLimit: 10,
          maxAttempts: 2,
          questions: [
            { id: 'q1', correctOptionIndex: 0 },
            { id: 'q2', correctOptionIndex: 1 }
          ]
       }
    };

    it('POST /api/.../submit should automatically evaluate and track attempts for a quiz submission', async () => {
       vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
       vi.mocked(prisma.module.findFirst).mockResolvedValueOnce(mockQuizModule as any);
       vi.mocked(prisma.submission.findUnique).mockResolvedValueOnce(null); // No previous submissions

       const req = createMockRequest({ answers: { 'q1': 0, 'q2': 1 }, timeSpent: 120 });
       const res = await submitQuiz(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '1' }) });
       const json = await res.json();

       expect(res.status).toBe(200);
       expect(json.grade).toBe(100);
       expect(json.isPass).toBe(true);
       expect(json.attemptsRemaining).toBe(1);

       expect(prisma.submission.upsert).toHaveBeenCalledWith(expect.objectContaining({
          create: expect.objectContaining({ submissionGrade: 100, submissionStatus: 'PASS' })
       }));
    });

    it('POST /api/.../submit should reject submission if max attempts are exhausted', async () => {
       vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
       vi.mocked(prisma.module.findFirst).mockResolvedValueOnce(mockQuizModule as any);
       
       // Student already used 2 attempts (max=2)
       vi.mocked(prisma.submission.findUnique).mockResolvedValueOnce({
          quizState: { attempts: 2, latestGrade: 50 },
          submissionGrade: 50
       } as any);

       const req = createMockRequest({ answers: { 'q1': 0, 'q2': 0 }, timeSpent: 300 });
       const res = await submitQuiz(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '1' }) });
       const json = await res.json();

       expect(res.status).toBe(403);
       expect(json.error).toContain('Maximum attempts reached');
       expect(prisma.submission.upsert).not.toHaveBeenCalled();
    });
  });

  describe('Assignment Submission & AI Grading', () => {
    const mockAssignmentModule = {
       moduleId: 'm-2',
       moduleType: 'ASSIGNMENT',
       assignmentConfig: { dueDate: new Date(Date.now() + 100000).toISOString(), aiGradingEnabled: false }
    };

    it('POST /api/.../submit should submit a plain assignment without AI grading', async () => {
       vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
       vi.mocked(prisma.module.findFirst).mockResolvedValueOnce(mockAssignmentModule as any);
       
       const req = createMockRequest({ assignmentFileUrl: '/uploads/dummy.pdf' });
       const res = await submitQuiz(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '2' }) }); // using submitQuiz which imported the submit api POST
       const json = await res.json();

       expect(res.status).toBe(200);
       expect(json.message).toContain('Assignment submitted successfully');
       expect(prisma.submission.upsert).toHaveBeenCalledWith(expect.objectContaining({
          create: expect.objectContaining({ 
             submissionStatus: 'INCOMPLETE',
             submissionGrade: 0
          })
       }));
    });

    it('POST /api/.../submit should reject assignment past deadline', async () => {
       vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
       vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({
         ...mockAssignmentModule,
         assignmentConfig: { dueDate: new Date(Date.now() - 10000).toISOString() }
       } as any);

       const req = createMockRequest({ assignmentFileUrl: '/uploads/dummy.pdf' });
       const res = await submitQuiz(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '2' }) });
       const json = await res.json();

       expect(res.status).toBe(403);
       expect(json.error).toContain('deadline for this assignment has passed');
       expect(prisma.submission.upsert).not.toHaveBeenCalled();
    });

    it('POST /api/.../submit should parse AI feedback and automatically assign a grade if AI grading is enabled', async () => {
       vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockStudentSession as any);
       vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({
         ...mockAssignmentModule,
         assignmentConfig: { dueDate: new Date(Date.now() + 100000).toISOString(), aiGradingEnabled: true, aiRubric: "Strict", aiDifficulty: "hard" }
       } as any);
       
       const req = createMockRequest({ assignmentFileUrl: '/uploads/ai-eval.pdf' });
       const res = await submitQuiz(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '2' }) });
       
       expect(res.status).toBe(200);
       
       const upsertCall = vi.mocked(prisma.submission.upsert).mock.calls[0][0];
       expect(upsertCall.create.submissionGrade).toBe(85);
       expect(upsertCall.create.submissionStatus).toBe('PASS');
       expect((upsertCall.create as any).assignmentState.instructorFeedback).toBe('Great work via AI!');
    });
  });
});
