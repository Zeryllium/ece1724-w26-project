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

    // make sure we landed on the course page
    await expect(page).toHaveURL(/.*\/courses\/.+/);
    await expect(page.locator('h1')).toContainText(courseName);

    // creator should have the instructor badge
    await expect(page.locator('span', { hasText: 'INSTRUCTOR' }).first()).toBeVisible();

    await page.getByTestId('add-module-button').click();
    await page.fill('input#moduleTitle', 'Demo Module 1');
    await page.selectOption('select#moduleType', 'LECTURE');
    await page.fill('input#moduleResourceUri', 'https://example.com/video');
    await page.fill('textarea#moduleDescription', 'First module description');
    await page.click('button:has-text("Add Module")');

    // check if module actually shows up
    await expect(page.locator('a', { hasText: 'Demo Module 1' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Module 1' })).toBeVisible();

    await page.click('a:has-text("View Details")');
    // verify navigation to edit view
    await expect(page).toHaveURL(/.*\/courses\/.+\/1/);

    // open the settings modal
    await page.click('button:has-text("Edit Module Settings")');

    // try changing the title
    await page.fill('input#moduleTitle', 'Updated Demo Module');
    await page.click('button:has-text("Save Changes")');

    // give the modal time to close
    await expect(page.locator('button:has-text("Save Changes")')).toBeHidden();

    // did the title update?
    await expect(page.locator('h1')).toContainText('Updated Demo Module');

    await page.click('a:has-text("Back to")');
    await expect(page).toHaveURL(/.*\/courses\/.+/);

    page.once('dialog', dialog => dialog.accept()); // Automatically accept the confirm alert
    await page.click('button:text-is("Delete")');

    // ensure module is gone
    await expect(page.locator('a', { hasText: 'Updated Demo Module' })).toBeHidden();

    page.once('dialog', dialog => dialog.accept()); // Accept confirm alert
    await page.click('button:text-is("Delete Course")');

    // verify we're back on dashboard
    await expect(page).toHaveURL(/.*\/courses/);

    // course must be deleted
    await expect(page.locator('h3', { hasText: courseName })).toBeHidden();
  });
});
