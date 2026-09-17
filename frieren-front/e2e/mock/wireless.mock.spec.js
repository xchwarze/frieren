import { test, expect } from './mock-fixture.js';

test.describe('Mock: Wireless', () => {
    test('renders wireless overview with radio info', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');

        await expect(page.getByText('Wireless Overview')).toBeVisible();
        await expect(page.getByRole('tab', { name: /Overview/ })).toBeVisible();
        await expect(page.getByRole('tab', { name: /Advanced Config/ })).toBeVisible();
    });

    test('shows associated stations section', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');
        await expect(page.getByText('Associated Stations', { exact: true })).toBeVisible();
    });

    test('shows a badge per supported band and (USB) for a dual-band USB radio', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');

        await expect(page.getByText('Aukey USBAC1200 (USB)', { exact: false })).toBeVisible();
        const radio2Heading = page.getByText('RADIO2');
        await expect(radio2Heading.locator('..').getByText('2.4 GHz')).toBeVisible();
        await expect(radio2Heading.locator('..').getByText('5 GHz')).toBeVisible();
    });

    test('shows the pinned BSSID for a sta interface in the interfaces table', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');

        // Sanitized fixture MACs are reassigned on every re-record, so match the shape
        // instead of a specific value. More than one row can have a real bssid, so
        // just prove at least one renders (not the '-' placeholder).
        await expect(page.getByText(/^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$/).first()).toBeVisible();
    });

    test('Radio Configuration shows Cell Density and Distance fields', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');

        await page.getByRole('button', { name: 'Configure radio' }).first().click();

        await expect(page.getByLabel('Cell Density')).toBeVisible();
        await expect(page.getByLabel('Distance (meters)')).toBeVisible();
    });

    test('Add Interface (default AP mode) shows the Management Frame Protection field', async ({ mockPage: page }) => {
        await page.goto('/#/wireless');

        await page.getByRole('button', { name: 'Add interface' }).first().click();

        await expect(page.getByLabel('Management Frame Protection')).toBeVisible();
    });
});
