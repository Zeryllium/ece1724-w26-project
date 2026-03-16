import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT as updateCourse } from '../app/api/courses/[courseId]/route';
import { enrollInCourse } from '../app/actions/enroll';
import { auth } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
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
});
