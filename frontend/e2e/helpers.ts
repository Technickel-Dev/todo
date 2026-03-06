import { Page, expect } from '@playwright/test';

export async function registerAndLogin(page: Page, baseEmail: string, password: string = 'Password123!') {
    const uniqueEmail = `${baseEmail.split('@')[0]}-${Math.random().toString(36).substring(7)}@${baseEmail.split('@')[1]}`;

    // 1. Register
    await page.goto('/register');
    await page.getByPlaceholder('email@example.com').fill(uniqueEmail);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('input[type="password"]').last().fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // 2. Wait for redirect and success message on Login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });

    // 3. Login
    await page.getByPlaceholder('email@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 4. Wait for dashboard load (root URL)
    await expect(page).toHaveURL(/http:\/\/localhost:5173\/?$/);
    await expect(page.locator('.animate-spin')).toHaveCount(0, { timeout: 15000 });
}
