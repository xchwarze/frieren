import { test, expect } from '@playwright/test';

test.describe('Network', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/network');
    });

    test('has Interfaces, DHCP and Diagnostics tabs', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /Interfaces/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /DHCP/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Diagnostics/ })).toBeVisible();
    });

    test('Interfaces tab is selected by default and shows the table', async ({ page }) => {
        await expect(page.getByRole('tab', { name: /Interfaces/ })).toHaveAttribute('aria-selected', 'true');

        const headers = ['Name', 'Proto', 'IP / Netmask', 'Gateway', 'Status', 'Device', 'Uptime', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
        }

        const rows = page.locator('table tbody tr');
        await expect(rows.first()).toBeVisible({ timeout: 15000 });
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('each interface row has edit, toggle, restart and delete buttons', async ({ page }) => {
        const firstRow = page.locator('table tbody tr', { has: page.locator('td button') }).first();
        await expect(firstRow).toBeVisible({ timeout: 15000 });

        const buttons = firstRow.locator('td').last().locator('button');
        expect(await buttons.count()).toBe(4);
    });

    test('Add Interface button opens the form with a Device field', async ({ page }) => {
        await page.getByRole('button', { name: 'Add' }).click();

        await expect(page.getByText('Add Interface')).toBeVisible();
        await expect(page.getByLabel('Interface Name')).toBeVisible();
        await expect(page.getByLabel('Device')).toBeVisible();
    });

    test('each row has a Restart button', async ({ page }) => {
        // Not clicked here: restarting a real interface (lan in particular) would disrupt
        // the very connection this test runs over. The mock suite exercises the actual
        // click+toast behavior safely against fixture data instead.
        const firstRow = page.locator('table tbody tr', { has: page.locator('td button') }).first();
        await expect(firstRow).toBeVisible({ timeout: 15000 });

        await expect(firstRow.getByRole('button', { name: 'Restart' })).toBeVisible();
    });

    test('DHCP tab shows leases and static leases', async ({ page }) => {
        await page.getByRole('tab', { name: /DHCP/ }).click();

        await expect(page.getByText('DHCP Leases', { exact: true })).toBeVisible();
        await expect(page.getByText('Static Leases', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    });

    test('Diagnostics tab runs ping against a host', async ({ page }) => {
        await page.getByRole('tab', { name: /Diagnostics/ }).click();

        const pingBtn = page.getByRole('button', { name: 'Ping' });
        await expect(pingBtn).toBeDisabled();

        await page.getByLabel('Host').fill('127.0.0.1');
        await expect(pingBtn).toBeEnabled();
        await pingBtn.click();

        const output = page.getByLabel('Output');
        await expect(output).not.toHaveValue('No output yet.', { timeout: 15000 });
    });

    test('Diagnostics tab shows the ARP table', async ({ page }) => {
        await page.getByRole('tab', { name: /Diagnostics/ }).click();
        await expect(page.getByText('ARP Table')).toBeVisible();

        const arpHeaders = ['IP', 'MAC', 'Device', 'State'];
        for (const header of arpHeaders) {
            await expect(page.getByRole('columnheader', { name: header, exact: true }).first()).toBeVisible();
        }
    });
});
