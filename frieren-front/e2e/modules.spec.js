import { test, expect } from '@playwright/test';

test.describe('Modules', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/modules');
    });

    test('displays available modules section', async ({ page }) => {
        await expect(page.getByText('Available Modules')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Get Modules' })).toBeVisible();
    });

    test('displays installed modules table', async ({ page }) => {
        await expect(page.getByText('Installed Modules', { exact: true })).toBeVisible();

        const headers = ['Module', 'Description', 'Author', 'Version', 'Size', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }
    });

    test('installed modules table has entries', async ({ page }) => {
        const rows = page.locator('table').first().locator('tbody tr');
        await expect(rows.first()).toBeVisible();
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('each module row has action buttons', async ({ page }) => {
        const actionBtn = page.locator('table tbody td .btn').first();
        await expect(actionBtn).toBeVisible({ timeout: 15000 });

        const firstDataRow = page.locator('table tbody tr', { has: page.locator('td .btn') }).first();
        const buttons = firstDataRow.locator('td').last().locator('.btn');
        const count = await buttons.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('module name is clickable', async ({ page }) => {
        const firstModuleBtn = page.locator('table').first().locator('tbody tr').first().getByRole('button').first();
        await expect(firstModuleBtn).toBeVisible();
        const name = await firstModuleBtn.textContent();
        expect(name.trim().length).toBeGreaterThan(0);
    });
});
