import { test, expect } from '@playwright/test';

test.describe('Wireless', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/wireless');
    });

    test('has Overview and Advanced Config tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /Overview/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Advanced Config/ })).toBeVisible();
    });

    test('Overview tab is selected by default', async ({ page }) => {
        const overviewTab = page.getByRole('tab', { name: /Overview/ });
        await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });

    test('displays wireless overview with radio info', async ({ page }) => {
        await expect(page.getByText('Wireless Overview')).toBeVisible();

        await expect(page.getByText(/RADIO0/)).toBeVisible();
        await expect(page.getByText(/2\.4 GHz/)).toBeVisible();
    });

    test('radio sections show interface table with correct headers', async ({ page }) => {
        const headers = ['Interface', 'SSID', 'Mode', 'BSSID', 'Encryption', 'Status', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header }).first()).toBeVisible();
        }
    });

    test('interfaces have action buttons (edit, toggle, delete)', async ({ page }) => {
        const actionBtn = page.locator('table tbody td button[aria-label]').first();
        await expect(actionBtn).toBeVisible({ timeout: 15000 });

        const firstDataRow = page.locator('table tbody tr', { has: page.locator('td button') }).first();
        const buttons = firstDataRow.locator('td').last().locator('button');
        const count = await buttons.count();
        expect(count).toBe(3);
    });

    test('radio header has settings, scan, and add buttons', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'Configure radio' }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Scan networks' }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add interface' }).first()).toBeVisible();
    });

    test('shows associated stations section', async ({ page }) => {
        await expect(page.getByText('Associated Stations', { exact: true })).toBeVisible();
    });

    test('wireless overview refresh button works', async ({ page }) => {
        const refreshBtn = page.getByText('Wireless Overview').locator('..').getByRole('button');
        await refreshBtn.click();
        await page.waitForTimeout(1000);
        await expect(page.getByText('Wireless Overview')).toBeVisible();
    });

    test('Advanced Config tab switches content', async ({ page }) => {
        await page.getByRole('tab', { name: /Advanced Config/ }).click();
        await expect(page.getByRole('tab', { name: /Advanced Config/ })).toHaveAttribute('aria-selected', 'true');
    });
});
