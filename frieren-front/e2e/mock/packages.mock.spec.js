import { test, expect } from './mock-fixture.js';

test.describe('Mock: Packages', () => {
    test('renders installed packages table', async ({ mockPage: page }) => {
        await page.goto('/#/packages');

        await expect(page.getByText('Installed Packages')).toBeVisible();
        const headers = ['Name', 'Version', 'Description', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header }).first()).toBeVisible();
        }

        const rows = page.locator('table').first().locator('tbody tr');
        await expect(rows.first()).toBeVisible();
    });

    test('renders available packages section', async ({ mockPage: page }) => {
        await page.goto('/#/packages');
        await expect(page.getByText('Available Packages', { exact: true })).toBeVisible();
    });
});
