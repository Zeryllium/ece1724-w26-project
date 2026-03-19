import { test, expect } from '@playwright/test';

test.describe('Instructor Flow Suite', () => {
  test('Instructor can create a course', async ({ page }) => {
    const testEmail = `instructor_${Date.now()}@test.com`;
    await page.goto('/signup');
    await page.fill('input[name="name"]', 'Demo Instructor');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="retype_password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/courses/);

    await page.click('text="Create Course"');
    await expect(page).toHaveURL(/.*\/courses\/new/);

    const courseName = `Demo Course ${Date.now()}`;
    await page.fill('input#courseName', courseName);
    await page.fill('textarea#courseDescription', 'A course created by Playwright');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/courses') && res.request().method() === 'POST'),
      page.click('button#submit-course-btn')
    ]);

    expect(response.status()).toBe(201);

    // make sure we landed on the course page
    await expect(page).toHaveURL(/.*\/courses\/.+/);
    await expect(page.locator('h1')).toContainText(courseName);

    // creator should have the instructor badge
    await expect(page.locator('span', { hasText: 'INSTRUCTOR' }).first()).toBeVisible();

  });
});
