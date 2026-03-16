import { test, expect } from '@playwright/test';

test.describe('General User Flows', () => {
  test('User can login and see unified dashboard components', async ({ page }) => {
    const testEmail = `general1_${Date.now()}@test.com`;
    await page.goto('/signup');
    await page.fill('input[name="name"]', 'General User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="retype_password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/courses/);
    await expect(page.locator('h1')).toContainText('Welcome, General User!');
    
    // Ensure no global role badge is visible on the generic dashboard
    await expect(page.locator('span.uppercase.tracking-wider', { hasText: 'INSTRUCTOR' })).toBeHidden();
    await expect(page.locator('span.uppercase.tracking-wider', { hasText: 'STUDENT' })).toBeHidden();

    // Check that the three decentralized logic sections rendered
    await expect(page.locator('h2', { hasText: 'Enrolled Courses' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Courses You Teach' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Course Marketplace' })).toBeVisible();
  });

  test('User can navigate to Course Creation', async ({ page }) => {
    const testEmail = `general2_${Date.now()}@test.com`;
    await page.goto('/signup');
    await page.fill('input[name="name"]', 'General User 2');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="retype_password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/courses/);

    await page.click('text="+ Create New Course"');
    await expect(page).toHaveURL(/.*\/courses\/new/);

    // No badge should preemptively exist before creation since they haven't submitted
    await expect(page.locator('span.uppercase.tracking-wider', { hasText: 'INSTRUCTOR' })).toBeHidden();
  });
});
