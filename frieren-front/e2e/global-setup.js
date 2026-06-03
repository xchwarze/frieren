import { test as setup, expect } from '@playwright/test';

const LOGIN_USER = process.env.FRIEREN_USER || 'root';
const LOGIN_PASS = process.env.FRIEREN_PASS || 'root';

setup('authenticate', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Username' }).fill(LOGIN_USER);
    await page.getByRole('textbox', { name: 'Password' }).fill(LOGIN_PASS);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page).toHaveURL(/#\/dashboard/);
    await expect(page.getByText('System Stats')).toBeVisible();

    await page.context().storageState({ path: './e2e/.auth/session.json' });
});
