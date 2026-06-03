import { test, expect } from './mock-fixture.js';

test.describe('Mock: Navigation', () => {
    test('sidebar shows all core links', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');

        const expectedLinks = ['Dashboard', 'Packages', 'Hardware', 'Modules', 'Wireless', 'Settings'];
        for (const link of expectedLinks) {
            await expect(page.getByRole('link', { name: link })).toBeVisible();
        }
    });

    test('navigation changes route', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');

        const routes = [
            { name: 'Packages', hash: '#/packages' },
            { name: 'Hardware', hash: '#/hardware' },
            { name: 'Modules', hash: '#/modules' },
            { name: 'Wireless', hash: '#/wireless' },
            { name: 'Settings', hash: '#/settings' },
            { name: 'Dashboard', hash: '#/dashboard' },
        ];

        for (const route of routes) {
            await page.getByRole('link', { name: route.name }).click();
            await expect(page).toHaveURL(new RegExp(route.hash.replace('/', '\\/')));
        }
    });

    test('header shows Frieren branding', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');
        await expect(page.getByText('Frieren').first()).toBeVisible();
    });

    test('page title is Frieren on all routes', async ({ mockPage: page }) => {
        const routes = ['/#/dashboard', '/#/packages', '/#/hardware', '/#/modules', '/#/wireless', '/#/settings'];
        for (const route of routes) {
            await page.goto(route);
            await expect(page).toHaveTitle('Frieren');
        }
    });
});
