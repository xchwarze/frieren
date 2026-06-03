import { test, expect } from './mock-fixture.js';

test.describe('Mock: Modules', () => {
    test('renders installed modules table', async ({ mockPage: page }) => {
        await page.goto('/#/modules');

        await expect(page.getByText('Installed Modules')).toBeVisible();
        const headers = ['Module', 'Description', 'Author', 'Version', 'Size', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
        }
    });

    test('renders available modules section', async ({ mockPage: page }) => {
        await page.goto('/#/modules');
        await expect(page.getByText('Available Modules')).toBeVisible();
    });
});
