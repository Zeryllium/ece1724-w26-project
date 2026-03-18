import { test, expect } from '@playwright/test';

test.describe('Instructor Flow Suite', () => {
  test('Instructor can create a course, add a module, edit it, and delete the course', async ({ page }) => {
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
      page.click('button:has-text("Create Course")')
    ]);

    expect(response.status()).toBe(201);

    // Contextual route check
    await expect(page).toHaveURL(/.*\/courses\/.+/);
    await expect(page.locator('h1')).toContainText(courseName);

    // Verify INSTRUCTOR badge is present contextually for the creator
    await expect(page.locator('span', { hasText: 'INSTRUCTOR' }).first()).toBeVisible();

    await page.fill('input#moduleTitle', 'Demo Module 1');
    await page.selectOption('select#moduleType', 'LECTURE');
    await page.fill('input#moduleResourceUri', 'https://example.com/video');
    await page.fill('textarea#moduleDescription', 'First module description');
    await page.click('button:has-text("Add Module")');

    // The module should appear on the page
    await expect(page.locator('h3', { hasText: 'Demo Module 1' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Module 1' })).toBeVisible();

    await page.click('a:has-text("Edit Module")');
    // Should route to the module edit page
    await expect(page).toHaveURL(/.*\/courses\/.+\/1/);

    // Click 'Edit Module Settings' button
    await page.click('button:has-text("Edit Module Settings")');

    // Update the module title and save
    await page.fill('input#moduleTitle', 'Updated Demo Module');
    await page.click('button:has-text("Save Changes")');

    // Wait for the form to close internally (button disappears)
    await expect(page.locator('button:has-text("Save Changes")')).toBeHidden();

    // Title in the header should update
    await expect(page.locator('h1')).toContainText('Updated Demo Module');

    await page.click('a:has-text("Back to")');
    await expect(page).toHaveURL(/.*\/courses\/.+/);

    page.once('dialog', dialog => dialog.accept()); // Automatically accept the confirm alert
    await page.click('button:text-is("Delete")');

    // The module should disappear
    await expect(page.locator('h3', { hasText: 'Updated Demo Module' })).toBeHidden();

    page.once('dialog', dialog => dialog.accept()); // Accept confirm alert
    await page.click('button:text-is("Delete Course")');

    // Should route back to dashboard
    await expect(page).toHaveURL(/.*\/courses/);

    // Course should not be visible anymore
    await expect(page.locator('h3', { hasText: courseName })).toBeHidden();
  });
});
