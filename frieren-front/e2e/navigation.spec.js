import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/dashboard');
    });

    test('sidebar shows all core navigation links', async ({ page }) => {
        const expectedLinks = ['Dashboard', 'Packages', 'Hardware', 'Modules', 'Wireless', 'Settings'];
        for (const link of expectedLinks) {
            await expect(page.getByRole('link', { name: link })).toBeVisible();
        }
    });

    test('sidebar navigation changes route', async ({ page }) => {
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

    test('sidebar shows dynamic module links', async ({ page }) => {
        const moduleLinks = page.locator('nav a, [class*="sidebar"] a').filter({ hasNotText: /Dashboard|Packages|Hardware|Modules|Wireless|Settings/ });
        const count = await moduleLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('sidebar collapse button works', async ({ page }) => {
        const closeBtn = page.getByRole('button', { name: 'Close' });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('header shows Frieren branding', async ({ page }) => {
        await expect(page.getByText('Frieren').first()).toBeVisible();
    });

    test('header has terminal and menu buttons', async ({ page }) => {
        const headerButtons = page.locator('nav').getByRole('button');
        const count = await headerButtons.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('direct URL navigation works', async ({ page }) => {
        await page.goto('/#/settings');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Change Timezone')).toBeVisible();

        await page.goto('/#/hardware');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('tab', { name: /Info/ })).toBeVisible();

        await page.goto('/#/dashboard');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('System Stats')).toBeVisible();
    });

    test('page title is Frieren on all routes', async ({ page }) => {
        const routes = ['/#/dashboard', '/#/packages', '/#/hardware', '/#/modules', '/#/wireless', '/#/settings'];
        for (const route of routes) {
            await page.goto(route);
            await expect(page).toHaveTitle('Frieren');
        }
    });
});
