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
