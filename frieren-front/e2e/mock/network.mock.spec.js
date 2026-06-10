import { test, expect } from './mock-fixture.js';

test.describe('Mock: Network', () => {
    test('has Interfaces, DHCP and Diagnostics tabs', async ({ mockPage: page }) => {
        await page.goto('/#/network');

        await expect(page.getByRole('tab', { name: /Interfaces/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /DHCP/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Diagnostics/ })).toBeVisible();
    });

    test('Interfaces tab renders interfaces table', async ({ mockPage: page }) => {
        await page.goto('/#/network');

        const headers = ['Name', 'Proto', 'IP / Netmask', 'Gateway', 'Status', 'Device', 'Uptime', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
        }

        const rows = page.locator('table tbody tr');
        await expect(rows.first()).toBeVisible();
        expect(await rows.count()).toBeGreaterThan(0);
    });

    test('DHCP tab renders leases and static leases cards', async ({ mockPage: page }) => {
        await page.goto('/#/network');
        await page.getByRole('tab', { name: /DHCP/ }).click();

        await expect(page.getByText('DHCP Leases', { exact: true })).toBeVisible();
        await expect(page.getByText('Static Leases', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    });

    test('Diagnostics tab renders tools and ARP table', async ({ mockPage: page }) => {
        await page.goto('/#/network');
        await page.getByRole('tab', { name: /Diagnostics/ }).click();

        await expect(page.getByRole('button', { name: 'Ping' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Traceroute' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Nslookup' })).toBeVisible();
        await expect(page.getByLabel('Host')).toBeVisible();
        await expect(page.getByText('ARP Table')).toBeVisible();
    });

    test('Diagnostics buttons are disabled until a host is entered', async ({ mockPage: page }) => {
        await page.goto('/#/network');
        await page.getByRole('tab', { name: /Diagnostics/ }).click();

        const pingBtn = page.getByRole('button', { name: 'Ping' });
        await expect(pingBtn).toBeDisabled();

        await page.getByLabel('Host').fill('127.0.0.1');
        await expect(pingBtn).toBeEnabled();
    });

    test('running ping shows command output', async ({ mockPage: page }) => {
        await page.goto('/#/network');
        await page.getByRole('tab', { name: /Diagnostics/ }).click();

        await page.getByLabel('Host').fill('127.0.0.1');
        await page.getByRole('button', { name: 'Ping' }).click();

        const output = page.getByLabel('Output');
        await expect(output).not.toHaveValue('No output yet.');
    });
});
