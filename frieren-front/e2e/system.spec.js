import { test, expect } from '@playwright/test';

test.describe('System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/system');
    });

    test('has three tabs: Info, Logs, Diagnostics', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /Info/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Logs/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Diagnostics/ })).toBeVisible();
    });

    test('Info tab shows USB devices table', async ({ page }) => {
        const usbSection = page.locator('.card', { hasText: 'USB Devices' });
        await expect(usbSection).toBeVisible();

        const usbHeaders = ['Bus', 'Device', 'ID', 'Name'];
        for (const header of usbHeaders) {
            await expect(usbSection.getByRole('columnheader', { name: header }).first()).toBeVisible();
        }

        const usbRows = usbSection.locator('table tbody tr');
        const count = await usbRows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Info tab shows Resources/filesystem table', async ({ page }) => {
        await expect(page.getByText('Resources')).toBeVisible();

        const fsHeaders = ['Filesystem', 'Type', 'Size', 'Used', 'Available', 'Mounted on'];
        for (const header of fsHeaders) {
            await expect(page.getByRole('columnheader', { name: header }).first()).toBeVisible();
        }

        const fsRows = page.locator('table').nth(1).locator('tbody tr');
        const count = await fsRows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Logs tab shows system logs', async ({ page }) => {
        await page.getByRole('tab', { name: /Logs/ }).click();
        await expect(page.getByRole('tabpanel')).toBeVisible();
        await expect(page.getByText('System Log')).toBeVisible();
    });

    test('Diagnostics tab shows diagnostics panel', async ({ page }) => {
        await page.getByRole('tab', { name: /Diagnostics/ }).click();
        await expect(page.getByRole('tabpanel')).toBeVisible();
    });

    test('USB devices refresh button works', async ({ page }) => {
        const usbSection = page.locator('.card', { hasText: 'USB Devices' });
        const refreshBtn = usbSection.locator('.panel-card-title').getByRole('button');
        await refreshBtn.click();
        await page.waitForTimeout(1000);
        await expect(usbSection).toBeVisible();
    });

    test('Resources refresh button works', async ({ page }) => {
        const resourcesSection = page.locator('.card', { hasText: 'Resources' });
        const refreshBtn = resourcesSection.locator('.panel-card-title').getByRole('button');
        await refreshBtn.click();
        await page.waitForTimeout(1000);
        await expect(resourcesSection).toBeVisible();
    });
});
