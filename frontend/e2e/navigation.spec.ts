import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Navigation and Detail Page', () => {
    const testEmail = `nav-${Date.now()}@example.com`;

    test.beforeEach(async ({ page }) => {
        await registerAndLogin(page, testEmail);
    });

    test('should navigate to detail page and back', async ({ page }) => {
        // 1. Setup - Create a Todo to navigate into
        await page.goto('/');

        const todoTitle = `Nav Test ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(todoTitle);
        await page.getByTitle('Create Todo').click();

        const todoCard = page.locator('.xray-film').filter({ hasText: todoTitle }).first();
        await expect(todoCard).toBeVisible();

        // 2. Click the 'View Details' icon
        await todoCard.getByTitle('View Details').click();

        // 3. Verify URL change
        await expect(page).toHaveURL(/\/todos\/\d+/);

        // 4. Verify content on Detail Page
        // Wait for loading to finish on detail page
        await expect(page.locator('.animate-spin')).toHaveCount(0, { timeout: 10000 });

        // Ensure the title is rendered large
        const detailHeading = page.locator('h1', { hasText: todoTitle });
        await expect(detailHeading).toBeVisible();

        // Ensure status pill is visible (Todo by default)
        await expect(page.locator('span', { hasText: 'Todo' })).toBeVisible();

        // 5. Navigate back to dashboard
        await page.getByRole('link', { name: /Back to Dashboard/i }).click();

        // 6. Verify URL is back to root
        await expect(page).toHaveURL('http://localhost:5173/');

        // Verify we see the dashboard again
        await expect(page.getByRole('button', { name: 'New Todo' })).toBeVisible();
    });
});
