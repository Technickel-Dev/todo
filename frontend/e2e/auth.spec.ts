import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    const testPassword = 'Password123!';

    test('should register a new user', async ({ page }) => {
        const email = `reg-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
        await page.goto('/register');

        await page.getByPlaceholder('email@example.com').fill(email);
        await page.locator('input[type="password"]').first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);

        await page.getByRole('button', { name: 'Register' }).click();

        // Should redirect to login with success message
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('text=Registration successful')).toBeVisible();
    });

    test('should login with registered user', async ({ page }) => {
        const email = `login-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        // 1. Register first to ensure user exists
        await page.goto('/register');
        await page.getByPlaceholder('email@example.com').fill(email);
        await page.locator('input[type="password"]').first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page.locator('text=Registration successful')).toBeVisible();

        // 2. Login
        await page.goto('/login');
        await page.getByPlaceholder('email@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(testPassword);

        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/http:\/\/localhost:5173\/?$/);
        await expect(page.getByRole('button', { name: 'New Todo' })).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        const email = `logout-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

        // 1. Register and Login
        await page.goto('/register');
        await page.getByPlaceholder('email@example.com').fill(email);
        await page.locator('input[type="password"]').first().fill(testPassword);
        await page.locator('input[type="password"]').last().fill(testPassword);
        await page.getByRole('button', { name: 'Register' }).click();
        await expect(page.locator('text=Registration successful')).toBeVisible();

        await page.goto('/login');
        await page.getByPlaceholder('email@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(testPassword);
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await expect(page).toHaveURL(/http:\/\/localhost:5173\/?$/);

        // 2. Click Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/);

        // Verify we can't go back to dashboard
        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByPlaceholder('email@example.com').fill('wrong@example.com');
        await page.getByPlaceholder('••••••••').fill('WrongPassword!');

        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Error message should appear (check for any text indicating failure)
        const errorDiv = page.locator('div[class*="text-red-400"]');
        await expect(errorDiv).toBeVisible();
        await expect(errorDiv).toContainText(/failed|unauthorized|invalid/i);
    });
});
