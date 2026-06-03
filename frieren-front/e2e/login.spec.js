import { test, expect } from '@playwright/test';

test.describe('Login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('shows login form when unauthenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Login')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    test('login with valid credentials redirects to dashboard', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('textbox', { name: 'Username' }).fill('root');
        await page.getByRole('textbox', { name: 'Password' }).fill('root');
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page).toHaveURL(/#\/dashboard/);
        await expect(page.getByText('System Stats')).toBeVisible();
    });

    test('login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('textbox', { name: 'Username' }).fill('invalid');
        await page.getByRole('textbox', { name: 'Password' }).fill('wrong');
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    });

    test('password visibility toggle works', async ({ page }) => {
        await page.goto('/');
        const passwordInput = page.locator('input[placeholder="Account password"]');
        await expect(passwordInput).toBeVisible();
        await passwordInput.fill('testpass');

        await expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleBtn = passwordInput.locator('xpath=..').locator('[role="button"]');
        await toggleBtn.click();

        await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('empty form submission shows validation', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page).toHaveURL(/#\/login|\/$/);
        await expect(page.getByText('Login')).toBeVisible();
    });
});
