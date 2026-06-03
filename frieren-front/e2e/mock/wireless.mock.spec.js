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
});
