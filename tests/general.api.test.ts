import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createCourse } from '../app/api/courses/route';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    course: { create: vi.fn() },
    managing: { create: vi.fn() },
    $transaction: vi.fn((callback) => {
      if (Array.isArray(callback)) return Promise.all(callback);
      return callback(prisma);
    }),
  },
}));

function createMockRequest(body: any) {
  return { json: vi.fn().mockResolvedValue(body) } as unknown as NextRequest;
}

describe('General Access API Endpoints', () => {
  const mockUserSession = { user: { id: 'general-user-123' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Course Creation (Available to All Registrants)', () => {
    it('POST /api/courses should allow any user to create a course', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockUserSession as any);
      
      const mockCourse = { courseId: 'course-1', courseName: 'User Created Course', totalCompleted: 0, totalEnrolled: 0 };
      vi.mocked(prisma.course.create).mockResolvedValueOnce(mockCourse as any);
      vi.mocked(prisma.managing.create).mockResolvedValueOnce({} as any);

      const req = createMockRequest({ courseName: 'User Created Course', courseDescription: 'Desc' });
      const res = await createCourse(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json).toEqual(mockCourse);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: { courseName: 'User Created Course', courseDescription: 'Desc' },
      });
      // Automatically assigns them the Manager context!
      expect(prisma.managing.create).toHaveBeenCalledWith({
        data: { instructorId: 'general-user-123', courseId: 'course-1' },
      });
    });

    it('POST /api/courses should fail without courseName', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockUserSession as any);

      const req = createMockRequest({ courseDescription: 'Missing name' });
      const res = await createCourse(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain('courseName is required');
    });

    it('POST /api/courses should reject unauthenticated requests', async () => {
      // Return null session
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);

      const req = createMockRequest({ courseName: 'Hacker Course' });
      const res = await createCourse(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toContain('Unauthorized');
    });
  });
});
