import { test, expect } from '@playwright/test';

test.describe('Packages', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/packages');
    });

    test('displays available packages section with update button', async ({ page }) => {
        await expect(page.getByText('Available Packages', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: /Update Lists/i })).toBeVisible();
    });

    test('displays installed packages table', async ({ page }) => {
        await expect(page.getByText('Installed Packages')).toBeVisible();

        const headers = ['Name', 'Version', 'Description', 'Action'];
        for (const header of headers) {
            await expect(page.getByRole('columnheader', { name: header }).first()).toBeVisible();
        }
    });

    test('installed packages table has entries', async ({ page }) => {
        const rows = page.locator('table').first().locator('tbody tr');
        await expect(rows.first()).toBeVisible();
        const count = await rows.count();
        expect(count).toBeGreaterThan(0);
    });

    test('search filter works on installed packages', async ({ page }) => {
        const searchBox = page.getByPlaceholder('Search installed packages...');
        await expect(searchBox).toBeVisible();

        const rowsBefore = await page.locator('table').first().locator('tbody tr').count();

        await searchBox.fill('busybox');
        await page.waitForTimeout(500);

        const rowsAfter = await page.locator('table').first().locator('tbody tr').count();
        expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);

        const firstRowText = await page.locator('table').first().locator('tbody tr').first().textContent();
        expect(firstRowText.toLowerCase()).toContain('busybox');
    });

    test('pagination is present', async ({ page }) => {
        await expect(page.getByText(/\d+-\d+ of \d+ items/)).toBeVisible();
        const paginationBtn = page.locator('.pagination').getByRole('listitem').filter({ hasText: '2' });
        await expect(paginationBtn).toBeVisible();
    });

    test('pagination navigates between pages', async ({ page }) => {
        const firstPageFirstRow = await page.locator('table').first().locator('tbody tr').first().textContent();

        await page.locator('.pagination').getByRole('listitem').filter({ hasText: '2' }).click();
        await page.waitForTimeout(500);

        const secondPageFirstRow = await page.locator('table').first().locator('tbody tr').first().textContent();
        expect(secondPageFirstRow).not.toBe(firstPageFirstRow);
    });

    test('each package has a remove button', async ({ page }) => {
        const firstRow = page.locator('table').first().locator('tbody tr').first();
        const deleteBtn = firstRow.getByRole('button');
        await expect(deleteBtn).toBeVisible();
    });
});
