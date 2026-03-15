import { test, expect } from '@playwright/test';

test.describe('Demo Instructor Course Management Suite', () => {
  
  test('Instructor can login and see dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo_instructor@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard and welcome instructor
    await expect(page).toHaveURL(/.*\/courses/);
    await expect(page.locator('h1')).toContainText('Welcome, Demo Instructor!');
  });

  test('Instructor can create a course, add a module, edit it, and delete the course', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo_instructor@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/courses/);

    await page.click('text="+ Create New Course"');
    await expect(page).toHaveURL(/.*\/courses\/new/);

    const courseName = `Demo Course ${Date.now()}`;
    await page.fill('input#courseName', courseName);
    await page.fill('textarea#courseDescription', 'A course created by Playwright');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/courses') && res.request().method() === 'POST'),
      page.click('button:has-text("Create Course")')
    ]);
    
    const body = await response.json();
    if (response.status() !== 201) {
      console.error("API failed:", body);
    }
    expect(response.status()).toBe(201);

    // Should be redirected to the new course page based on our previous logic
    await expect(page).toHaveURL(/.*\/courses\/.+/);
    await expect(page.locator('h1')).toContainText(courseName);

    await page.fill('input#moduleTitle', 'Demo Module 1');
    await page.selectOption('select#moduleType', 'LECTURE');
    await page.fill('input#moduleResourceUri', 'https://example.com/video');
    await page.fill('textarea#moduleDescription', 'First module description');
    await page.click('button:has-text("Add Module")');

    // The module should appear on the page
    await expect(page.locator('h3', { hasText: 'Demo Module 1' })).toBeVisible();
    await expect(page.locator('span', { hasText: 'Module 1' })).toBeVisible();

    await page.click('a:has-text("Edit")');
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
