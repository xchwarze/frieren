import { test, expect } from './mock-fixture.js';

test.describe('Mock: System', () => {
    test('Info tab renders USB and filesystem tables', async ({ mockPage: page }) => {
        await page.goto('/#/system');

        await expect(page.getByRole('tab', { name: /Info/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Logs/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Diagnostics/ })).toBeVisible();

        const usbSection = page.locator('.card', { hasText: 'USB Devices' });
        await expect(usbSection).toBeVisible();
        const usbRows = usbSection.locator('table tbody tr');
        const count = await usbRows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Logs tab renders system logs', async ({ mockPage: page }) => {
        await page.goto('/#/system');
        await page.getByRole('tab', { name: /Logs/ }).click();
        await expect(page.getByText('System Log')).toBeVisible();
    });
});
