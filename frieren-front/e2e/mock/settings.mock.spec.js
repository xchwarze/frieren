import { test, expect } from './mock-fixture.js';

test.describe('Mock: Settings', () => {
    test('renders all settings sections', async ({ mockPage: page }) => {
        await page.goto('/#/settings');

        await expect(page.getByText('Change Timezone')).toBeVisible();
        await expect(page.getByText('Change Hostname')).toBeVisible();
        await expect(page.getByText('Terminal')).toBeVisible();
        await expect(page.getByText('User Management')).toBeVisible();
        await expect(page.getByText('Change Panel Theme')).toBeVisible();
    });

    test('hostname field has value from mock', async ({ mockPage: page }) => {
        await page.goto('/#/settings');

        const hostnameInput = page.getByRole('textbox', { name: 'Hostname' });
        await expect(hostnameInput).toBeVisible();
        const value = await hostnameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
    });
});
