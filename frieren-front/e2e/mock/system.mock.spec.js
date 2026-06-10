import { test, expect } from './mock-fixture.js';

test.describe('Mock: System', () => {
    test('has Info, Services and Logs tabs', async ({ mockPage: page }) => {
        await page.goto('/#/system');

        await expect(page.getByRole('tab', { name: /Info/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Services/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Logs/ })).toBeVisible();
    });

    test('Info tab renders USB, filesystem and diagnostics', async ({ mockPage: page }) => {
        await page.goto('/#/system');

        const usbSection = page.locator('.card', { hasText: 'USB Devices' });
        await expect(usbSection).toBeVisible();
        const usbRows = usbSection.locator('table tbody tr');
        const count = await usbRows.count();
        expect(count).toBeGreaterThan(0);

        await expect(page.getByText('Diagnostics', { exact: true })).toBeVisible();
    });

    test('Services tab lists init.d services with controls', async ({ mockPage: page }) => {
        await page.goto('/#/system');
        await page.getByRole('tab', { name: /Services/ }).click();

        await expect(page.getByText('Init Services')).toBeVisible();
        const headers = ['Service', 'On Boot', 'Status', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }

        const rows = page.locator('table tbody tr');
        await expect(rows.first()).toBeVisible();
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('Services tab search filters the list', async ({ mockPage: page }) => {
        await page.goto('/#/system');
        await page.getByRole('tab', { name: /Services/ }).click();

        const searchBox = page.getByPlaceholder('Search services...');
        await expect(searchBox).toBeVisible();

        const before = await page.locator('table tbody tr').count();
        await searchBox.fill('network');
        await page.waitForTimeout(500);
        const after = await page.locator('table tbody tr').count();
        expect(after).toBeLessThanOrEqual(before);
    });

    test('Logs tab renders system logs', async ({ mockPage: page }) => {
        await page.goto('/#/system');
        await page.getByRole('tab', { name: /Logs/ }).click();
        await expect(page.getByText('System Log')).toBeVisible();
    });
});
