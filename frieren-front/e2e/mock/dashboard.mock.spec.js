import { test, expect, mockApi, mockApiWithOverrides } from './mock-fixture.js';

test.describe('Mock: Dashboard', () => {
    test('renders system stats with mock data', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');

        await expect(page.getByText('System Stats')).toBeVisible();
        await expect(page.getByText('cpu usage')).toBeVisible();
        await expect(page.getByText('memory')).toBeVisible();
        await expect(page.getByText('swap')).toBeVisible();
        await expect(page.getByText('uptime')).toBeVisible();
    });

    test('renders system information table', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');

        await expect(page.getByText('System Information')).toBeVisible();

        const expectedRows = ['Hostname', 'Model', 'Architecture', 'Target Platform', 'Firmware Version', 'Kernel Version'];
        for (const label of expectedRows) {
            await expect(page.getByRole('cell', { name: label, exact: true })).toBeVisible();
        }
    });

    test('renders news section with entries', async ({ mockPage: page }) => {
        await page.goto('/#/dashboard');

        await expect(page.getByText('News')).toBeVisible();
        const newsRows = page.locator('table').last().locator('tbody tr');
        const count = await newsRows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('no update alert when version is current', async ({ page }) => {
        await mockApi(page);
        await page.goto('/#/dashboard');

        await expect(page.getByText('System Stats')).toBeVisible();
        await expect(page.getByText(/Latest version:/)).toHaveCount(0);
    });

    test('shows update alert with Update button when a newer version exists', async ({ page }) => {
        await mockApiWithOverrides(page, {
            dashboard: {
                getNews: {
                    news: [],
                    lastVersion: {
                        version: '9.9.9',
                        comment: 'Big release',
                        updateUrl: 'https://example.com/frieren-9.9.9.tar.gz',
                    },
                },
            },
        });

        await page.goto('/#/dashboard');

        await expect(page.getByText('Latest version: 9.9.9')).toBeVisible();
        await expect(page.getByText('Big release')).toBeVisible();

        await page.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText('Confirm System Update')).toBeVisible();
    });
});
