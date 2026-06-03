import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/settings');
    });

    test('displays timezone section', async ({ page }) => {
        await expect(page.getByText('Change Timezone')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Timezone' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sync from Browser' })).toBeVisible();
    });

    test('timezone dropdown has options', async ({ page }) => {
        const select = page.getByRole('combobox', { name: 'Timezone' });
        await expect(select).toBeVisible();
        const options = await select.evaluate((el) => el.options.length);
        expect(options).toBeGreaterThan(10);
    });

    test('displays hostname section', async ({ page }) => {
        await expect(page.getByText('Change Hostname')).toBeVisible();
        const hostnameInput = page.getByRole('textbox', { name: 'Hostname' });
        await expect(hostnameInput).toBeVisible();
        const value = await hostnameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
    });

    test('displays terminal settings', async ({ page }) => {
        await expect(page.getByText('Terminal')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Terminal Theme' })).toBeVisible();
        await expect(page.getByRole('spinbutton', { name: 'Font Size' })).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Cursor Style' })).toBeVisible();
    });

    test('terminal theme has expected options', async ({ page }) => {
        const select = page.getByRole('combobox', { name: 'Terminal Theme' });
        await expect(select).toBeVisible();
        const count = await select.evaluate((el) => el.options.length);
        expect(count).toBeGreaterThanOrEqual(5);
    });

    test('displays user management section', async ({ page }) => {
        await expect(page.getByText('User Management')).toBeVisible();
        await expect(page.getByPlaceholder('Enter current password')).toBeVisible();
        await expect(page.getByPlaceholder('Enter new password')).toBeVisible();
        await expect(page.getByPlaceholder('Confirm new password')).toBeVisible();
    });

    test('displays panel theme section', async ({ page }) => {
        await expect(page.getByText('Change Panel Theme')).toBeVisible();
        const themeCombo = page.getByRole('combobox', { name: 'Interface Theme' });
        await expect(themeCombo).toBeVisible();

        const options = await themeCombo.locator('option').allTextContents();
        expect(options).toContain('Light');
        expect(options).toContain('Dark');
        expect(options).toContain('Auto');
    });

    test('cursor blink and autologin checkboxes exist', async ({ page }) => {
        await expect(page.getByRole('checkbox', { name: 'Cursor Blink' })).toBeVisible();
        await expect(page.getByRole('checkbox', { name: 'Use Autologin' })).toBeVisible();
    });

    test('at least one save button is present', async ({ page }) => {
        const saveButtons = page.getByRole('button', { name: 'Save' });
        const count = await saveButtons.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});
