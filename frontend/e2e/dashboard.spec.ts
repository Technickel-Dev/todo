import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Dashboard Interactions', () => {
    const testEmail = `dashboard-${Date.now()}@example.com`;

    test.beforeEach(async ({ page }) => {
        await registerAndLogin(page, testEmail);
    });

    test('should create a new todo', async ({ page }) => {
        const todoTitle = `New E2E Todo ${Date.now()}`;

        // Click New Todo button
        await page.getByRole('button', { name: 'New Todo' }).click();

        // Fill the add input and save
        const input = page.getByPlaceholder('Todo name');
        await input.fill(todoTitle);
        await page.getByTitle('Create Todo').click();

        // Wait for the new todo to appear in the list
        const todoItem = page.locator('h3', { hasText: todoTitle });
        await expect(todoItem).toBeVisible();
    });

    test('should toggle a todo status', async ({ page }) => {
        // Create a new todo unique for this test
        const todoTitle = `Toggle Me ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(todoTitle);
        await page.getByTitle('Create Todo').click();

        // Find the created todo container
        const todoCard = page.locator('.xray-film').filter({ hasText: todoTitle }).first();
        await expect(todoCard).toBeVisible();

        // Not completed by default
        await expect(todoCard.locator('h3')).not.toHaveClass(/line-through/);

        // Click the toggle button (the first button in the card is usually the toggle check button)
        const toggleButton = todoCard.locator('button').first();
        await toggleButton.click();

        // Verify it becomes completed (strikethrough)
        await expect(todoCard.locator('h3')).toHaveClass(/line-through/);
    });

    test('should edit a todo', async ({ page }) => {
        const todoTitle = `Edit Me ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(todoTitle);
        await page.getByTitle('Create Todo').click();

        const todoCard = page.locator('.xray-film').filter({ hasText: todoTitle }).first();
        await expect(todoCard).toBeVisible();

        // Click the edit button (has 'Edit Todo' title)
        await todoCard.getByTitle('Edit Todo').click();

        // The inline form should appear. Find the input by placeholder.
        const editInput = page.getByPlaceholder('Todo name');
        const newTitle = `${todoTitle} - Updated`;
        await editInput.fill(newTitle);

        // Save
        await page.getByTitle('Save Changes').click();

        // Verify the new title is displayed
        await expect(page.locator('h3', { hasText: newTitle })).toBeVisible();
        await expect(page.locator('h3', { hasText: new RegExp(`^${todoTitle}$`) })).toHaveCount(0);
    });

    test('should delete a todo', async ({ page }) => {
        const todoTitle = `Delete Me ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(todoTitle);
        await page.getByTitle('Create Todo').click();

        const todoCard = page.locator('.xray-film').filter({ hasText: todoTitle }).first();
        await expect(todoCard).toBeVisible();

        // Click the delete button
        await todoCard.getByTitle('Delete Todo').click();

        // Verify it's removed from the DOM
        await expect(todoCard).toHaveCount(0);
    });

    test('should filter todos by status', async ({ page }) => {
        // Create an Active and a Completed todo
        const activeTitle = `Active Todo ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(activeTitle);
        await page.getByTitle('Create Todo').click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${activeTitle}$`) })).toBeVisible();

        const completedTitle = `Completed Todo ${Date.now()}`;
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(completedTitle);
        await page.getByTitle('Create Todo').click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${completedTitle}$`) })).toBeVisible();

        // Mark the second one as completed
        const completedCard = page.locator('.xray-film').filter({ hasText: completedTitle }).first();
        await expect(completedCard).toBeVisible();
        await completedCard.locator('button').first().click();
        await expect(completedCard.locator('h3')).toHaveClass(/line-through/);

        // Filter by Active
        await page.getByRole('button', { name: 'All' }).click(); // Open dropdown
        await page.getByRole('button', { name: 'Active', exact: true }).click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${activeTitle}$`) })).toBeVisible();
        await expect(page.locator('h3', { hasText: new RegExp(`^${completedTitle}$`) })).toHaveCount(0);

        // Filter by Completed
        await page.getByRole('button', { name: 'Active' }).click(); // Open dropdown
        await page.getByRole('button', { name: 'Completed', exact: true }).click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${activeTitle}$`) })).toHaveCount(0);
        await expect(page.locator('h3', { hasText: new RegExp(`^${completedTitle}$`) })).toBeVisible();

        // Filter by All
        await page.getByRole('button', { name: 'Completed' }).click(); // Open dropdown
        await page.getByRole('button', { name: 'All', exact: true }).click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${activeTitle}$`) })).toBeVisible();
        await expect(page.locator('h3', { hasText: new RegExp(`^${completedTitle}$`) })).toBeVisible();
    });

    test('should search and debounce results', async ({ page }) => {
        const searchTitle = `SearchTarget ${Date.now()}`;
        const ignoredTitle = `Noise ${Date.now()}`;

        // Create two distinctly named todos
        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(searchTitle);
        await page.getByTitle('Create Todo').click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${searchTitle}$`) })).toBeVisible();

        await page.getByRole('button', { name: 'New Todo' }).click();
        await page.getByPlaceholder('Todo name').fill(ignoredTitle);
        await page.getByTitle('Create Todo').click();
        await expect(page.locator('h3', { hasText: new RegExp(`^${ignoredTitle}$`) })).toBeVisible();

        await expect(page.locator('h3', { hasText: new RegExp(`^${searchTitle}$`) })).toBeVisible();
        await expect(page.locator('h3', { hasText: new RegExp(`^${ignoredTitle}$`) })).toBeVisible();

        // Perform search
        const searchInput = page.getByPlaceholder('Search todos...');
        await searchInput.fill('SearchTarget');

        // Due to 300ms debounce, wait a moment for the filter to apply
        await page.waitForTimeout(500);

        // Verify only the search target remains
        await expect(page.locator('h3', { hasText: new RegExp(`^${searchTitle}$`) })).toBeVisible();
        await expect(page.locator('h3', { hasText: new RegExp(`^${ignoredTitle}$`) })).toHaveCount(0);

        // Clear search
        await searchInput.fill('');
        await page.waitForTimeout(500);
        await expect(page.locator('h3', { hasText: new RegExp(`^${ignoredTitle}$`) })).toBeVisible();
    });
});
