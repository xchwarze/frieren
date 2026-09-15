import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/dashboard');
    });

    test('displays system stats panel', async ({ page }) => {
        await expect(page.getByText('System Stats')).toBeVisible();
        await expect(page.getByText('cpu usage')).toBeVisible();
        await expect(page.getByText('memory')).toBeVisible();
        await expect(page.getByText('swap')).toBeVisible();
        await expect(page.getByText('uptime')).toBeVisible();
    });

    test('system stats show numeric values', async ({ page }) => {
        await expect(page.getByText(/\d+:\d+ hrs/)).toBeVisible({ timeout: 10000 });

        const cpuEl = page.locator('text=cpu usage').locator('..');
        const cpuText = await cpuEl.textContent();
        expect(cpuText).toMatch(/\d+%/);

        const memEl = page.locator('text=memory').locator('..');
        const memText = await memEl.textContent();
        expect(memText).toMatch(/\d+\.?\d*%/);
    });

    test('displays system information table', async ({ page }) => {
        await expect(page.getByText('System Information')).toBeVisible();

        const expectedRows = ['Hostname', 'Model', 'Architecture', 'Target Platform', 'Firmware Version', 'Kernel Version'];
        for (const label of expectedRows) {
            await expect(page.getByRole('cell', { name: label, exact: true })).toBeVisible();
        }
    });

    test('system info has non-empty values', async ({ page }) => {
        const hostnameCell = page.getByRole('row', { name: /Hostname/ }).getByRole('cell').nth(1);
        const hostnameText = await hostnameCell.textContent();
        expect(hostnameText.trim().length).toBeGreaterThan(0);

        const modelCell = page.getByRole('row', { name: /Model/ }).getByRole('cell').nth(1);
        const modelText = await modelCell.textContent();
        expect(modelText).toContain('GL');
    });

    test('displays news section', async ({ page }) => {
        await expect(page.getByText('News')).toBeVisible();
        await expect(page.getByText('Latest updates from the Frieren project')).toBeVisible();

        // NewsCard renders no table at all once the remote fetch resolves to an error (e.g.
        // this device having no WAN/internet route) — wait for the card's own fetch to settle
        // before deciding, so this isn't racing the loading skeleton (which shares the same
        // header text) or misreporting an offline device as a broken app.
        const newsCard = page.locator('.panel-card', { hasText: 'News' });
        await expect(newsCard.getByRole('button', { name: 'Refresh' })).toBeEnabled();

        const newsHeaders = page.getByRole('columnheader');
        const hasNews = await newsHeaders.getByText('Date').isVisible();
        test.skip(!hasNews, 'Device has no internet connection to fetch remote news');

        await expect(newsHeaders.getByText('Title')).toBeVisible();
        await expect(newsHeaders.getByText('Description')).toBeVisible();
    });

    test('news table has entries', async ({ page }) => {
        const newsCard = page.locator('.panel-card', { hasText: 'News' });
        await expect(newsCard.getByRole('button', { name: 'Refresh' })).toBeEnabled();

        const hasNews = await page.getByRole('columnheader').getByText('Date').isVisible();
        test.skip(!hasNews, 'Device has no internet connection to fetch remote news');

        const newsRows = page.locator('table').last().locator('tbody tr');
        const count = await newsRows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('system stats refresh button updates data', async ({ page }) => {
        const statsCard = page.locator('.panel-card', { hasText: 'System Stats' });
        await expect(statsCard).toBeVisible();

        const refreshBtn = statsCard.locator('.panel-card-title').getByRole('button', { name: 'Refresh' });
        await refreshBtn.click();
        await page.waitForTimeout(1500);

        const statsAfter = await statsCard.textContent();
        expect(statsAfter).toMatch(/\d+\.?\d*%/);
    });
});
