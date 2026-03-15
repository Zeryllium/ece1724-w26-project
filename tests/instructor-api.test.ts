import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createCourse } from '../app/api/courses/route';
import { PUT as updateCourse, DELETE as deleteCourse } from '../app/api/courses/[courseId]/route';
import { POST as createModule } from '../app/api/courses/[courseId]/modules/route';
import { PUT as updateModule, DELETE as deleteModule } from '../app/api/courses/[courseId]/modules/[moduleIndex]/route';
import { auth, ROLES } from '../lib/auth';
import { prisma } from '../lib/prisma';

// Mock dependencies
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  ROLES: {
    INSTRUCTOR: 'INSTRUCTOR',
    STUDENT: 'STUDENT',
    ADMIN: 'ADMIN',
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('../lib/prisma', () => ({
  prisma: {
    course: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    managing: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    module: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    enrollment: {
      deleteMany: vi.fn(),
    },
    comment: {
      deleteMany: vi.fn(),
    },
    submission: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      // If callback is an array of promises, return Promise.all
      if (Array.isArray(callback)) {
        return Promise.all(callback);
      }
      // If callback is a function, execute it with the mocked prisma as the transaction object
      return callback(prisma);
    }),
  },
}));

// Helper to create a mock NextRequest
function createMockRequest(body: any) {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('Instructor API Endpoints', () => {
  const mockInstructorSession = {
    user: { id: 'instructor-123', role: ROLES.INSTRUCTOR },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Course Endpoints', () => {
    it('POST /api/courses should create a course and managing record', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
      
      const mockCourse = { courseId: 'course-1', courseName: 'Test Course' };
      vi.mocked(prisma.course.create).mockResolvedValueOnce(mockCourse as any);
      vi.mocked(prisma.managing.create).mockResolvedValueOnce({} as any);

      const req = createMockRequest({ courseName: 'Test Course', courseDescription: 'Desc' });
      const res = await createCourse(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json).toEqual(mockCourse);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: { courseName: 'Test Course', courseDescription: 'Desc' },
      });
      expect(prisma.managing.create).toHaveBeenCalledWith({
        data: { instructorId: 'instructor-123', courseId: 'course-1' },
      });
    });

    it('POST /api/courses should fail without courseName', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);

      const req = createMockRequest({ courseDescription: 'Desc' });
      const res = await createCourse(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('courseName is required');
    });

    it('PUT /api/courses/[courseId] should update course if managing instructor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({ courseId: 'course-1' } as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      
      const mockUpdated = { courseId: 'course-1', courseName: 'New Name' };
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

    it('PUT /api/courses/[courseId] should fail if user is not managing instructor', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
      vi.mocked(prisma.course.findUnique).mockResolvedValueOnce({ courseId: 'course-1' } as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce(null as any); // Not managing

      const req = createMockRequest({ courseName: 'New Name' });
      const res = await updateCourse(req, { params: Promise.resolve({ courseId: 'course-1' }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain('Forbidden');
    });

    it('DELETE /api/courses/[courseId] should cascade delete via transaction', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
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
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
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
          moduleResourceUri: 'http://test.com/vid',
        },
      });
    });

    it('POST /api/courses/[courseId]/modules should fail with invalid moduleType', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
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
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
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
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
      vi.mocked(prisma.managing.findUnique).mockResolvedValueOnce({ instructorId: 'instructor-123' } as any);
      vi.mocked(prisma.module.findFirst).mockResolvedValueOnce({ moduleId: 'm-1', moduleTitle: 'Old' } as any);

      const req = createMockRequest({}); // Empty body
      const res = await updateModule(req, { params: Promise.resolve({ courseId: 'course-1', moduleIndex: '1' }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('No valid fields provided');
    });

    it('DELETE /api/courses/[courseId]/modules/[moduleIndex] should delete and resequence', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockInstructorSession as any);
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
