import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT as updateCourse, DELETE as deleteCourse } from '../app/api/courses/[courseId]/route';
import { POST as createModule } from '../app/api/courses/[courseId]/modules/route';
import { PUT as updateModule, DELETE as deleteModule } from '../app/api/courses/[courseId]/modules/[moduleIndex]/route';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
  isManaging: vi.fn().mockResolvedValue(true),
  ROLES: { INSTRUCTOR: 'INSTRUCTOR', STUDENT: 'STUDENT', ADMIN: 'ADMIN' },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    course: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    managing: { findUnique: vi.fn(), deleteMany: vi.fn() },
    module: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
    enrollment: { deleteMany: vi.fn() },
    comment: { deleteMany: vi.fn() },
    submission: { deleteMany: vi.fn() },
    $transaction: vi.fn((callback) => {
      if (Array.isArray(callback)) return Promise.all(callback);
      return callback(prisma);
    }),
  },
}));

function createMockRequest(body: any) {
  return { json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

describe('Instructor/Manager API Endpoints', () => {
  const mockManagerSession = { user: { id: 'instructor-123' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Course Endpoints', () => {
    it('PUT /api/courses/[courseId] should update course if user is managing it', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({ courseId: 'course-1' } as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      
      const mockUpdated = { courseId: 'course-1', courseName: 'New Name', totalCompleted: 0, totalEnrolled: 0 };
      vi.mocked(prisma.course.update).mockResolvedValueOnce(mockUpdated as any);

      const req = createMockRequest({ courseName: 'New Name' });
      const res = await updateCourse(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual(mockUpdated);
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        data: { courseName: 'New Name' },
      });
    });

    it('DELETE /api/courses/[courseId] should cascade delete via transaction', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
        vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({ courseId: 'course-1' } as any);
        vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
  
        const req = createMockRequest({});
        const res = await deleteCourse(req, { params: Promise.resolve({ courseId: 'course-1' }) });
  
        expect(res.status).toBe(200);
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(prisma.course.delete).toHaveBeenCalledWith({ where: { courseId: 'course-1' } });
    });
  });

  describe('Module Endpoints', () => {
    it('POST /api/courses/[courseId]/modules should append a new module', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleIndex: 2 } as any); // Last module is 2
      
      const mockModule = { moduleId: 'm-1', moduleIndex: 3, moduleTitle: 'Mod 3' };
      vi.mocked(prisma.module.create).mockResolvedValueOnce(mockModule as any);

      const req = createMockRequest({
        moduleTitle: 'Mod 3',
        moduleType: 'LECTURE',
        moduleResourceUri: 'http://test.com/vid',
      });
      const res = await createModule(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json).toEqual(mockModule);
      expect(prisma.module.create).toHaveBeenCalledWith({
        data: {
          courseId: 'course-1',
          moduleIndex: 3,
          moduleTitle: 'Mod 3',
          moduleDescription: '',
          moduleType: 'LECTURE',
          moduleResources: {
            create: [{
              s3Path: 'http://test.com/vid',
              originalName: 'http://test.com/vid',
              mimeType: 'application/octet-stream',
              size: 0,
              uploaderId: 'instructor-123'
            }]
          },
          quizConfig: null,
          assignmentConfig: null,
        },
      });
    });

    it('POST /api/courses/[courseId]/modules should create a QUIZ module with valid config', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleIndex: 2 } as any);
      
      const req = createMockRequest({
        moduleTitle: 'Quiz 1',
        moduleType: 'QUIZ',
        quizConfig: {
           timeLimit: 10,
           maxAttempts: 2,
           questions: [{ id: 'q1', text: '5+5?', options: ['10', '11'], correctOptionIndex: 0 }]
        }
      });
      vi.mocked(prisma.module.create).mockResolvedValueOnce({ moduleId: 'm-2', moduleType: 'QUIZ' } as any);
      
      const res = await createModule(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(prisma.module.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
           moduleType: 'QUIZ',
           quizConfig: expect.any(Object)
        })
      }));
    });

    it('POST /api/courses/[courseId]/modules should fail quizzes with invalid config', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      
      const req = createMockRequest({
        moduleTitle: 'Quiz 1',
        moduleType: 'QUIZ',
        quizConfig: {
           timeLimit: -5, // Invalid!
           maxAttempts: 2,
           questions: [] // Invalid!
        }
      });
      const res = await createModule(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid quiz configuration payload');
    });

    it('POST /api/courses/[courseId]/modules should fail with invalid moduleType', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);

      const req = createMockRequest({
        moduleTitle: 'Mod 3',
        moduleType: 'INVALID_TYPE',
        moduleResourceUri: 'http://test.com/vid',
      });
      const res = await createModule(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('moduleType must be LECTURE, ASSIGNMENT, or QUIZ');
    });

    it('PUT /api/courses/[courseId]/modules/[moduleIndex] should update fields', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleId: 'm-1', moduleTitle: 'Old' } as any);
      vi.mocked(prisma.module.update).mockResolvedValueOnce({ moduleId: 'm-1', moduleTitle: 'New' } as any);

      const req = createMockRequest({ moduleTitle: 'New' });
      const res = await updateModule(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.moduleTitle).toBe('New');
    });

    it('PUT /api/courses/[courseId]/modules/[moduleIndex] should fail with empty update', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleId: 'm-1', moduleTitle: 'Old' } as any);

      const req = createMockRequest({}); // Empty body
      const res = await updateModule(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '1' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('No valid fields provided');
    });

    it('DELETE /api/courses/[courseId]/modules/[moduleIndex] should delete and resequence', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockManagerSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleId: 'm-1', moduleIndex: 2 } as any);

      const req = createMockRequest({});
      const res = await deleteModule(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '2' }) });

      expect(res.status).toBe(200);
      expect(prisma.module.delete).toHaveBeenCalledWith({ where: { moduleId: 'm-1' } });
      expect(prisma.module.updateMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1', moduleIndex: { gt: 2 } },
        data: { moduleIndex: { decrement: 1 } },
      });
    });
  });
});
