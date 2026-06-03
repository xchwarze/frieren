import { test, expect, mockApi, mockApiWithOverrides } from './mock-fixture.js';

test.describe('Mock: Login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('shows login form', async ({ page }) => {
        await mockApi(page);
        await page.goto('/');

        await expect(page.getByText('Login')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    test('valid login redirects to dashboard', async ({ page }) => {
        await mockApi(page);
        await page.goto('/');

        await page.getByRole('textbox', { name: 'Username' }).fill('root');
        await page.getByRole('textbox', { name: 'Password' }).fill('root');
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page).toHaveURL(/#\/dashboard/);
        await expect(page.getByText('System Stats')).toBeVisible();
    });

    test('invalid login shows error', async ({ page }) => {
        await mockApiWithOverrides(page, {
            login: {
                login: { __status: 400, error: 'Not logged_in' },
            },
        });

        await page.goto('/');
        await page.getByRole('textbox', { name: 'Username' }).fill('wrong');
        await page.getByRole('textbox', { name: 'Password' }).fill('wrong');
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    });
});
