import { test, expect } from './api-fixture.js';

test.describe('API: Packages', () => {
    test('getInstalledPackages returns package list', async ({ api }) => {
        const { response, json } = await api.post('packages', 'getInstalledPackages');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('packages');
        expect(Array.isArray(json.packages)).toBe(true);
        expect(json.packages.length).toBeGreaterThan(0);

        const pkg = json.packages[0];
        expect(pkg).toHaveProperty('name');
        expect(pkg).toHaveProperty('version');
        expect(pkg.name.length).toBeGreaterThan(0);
    });

    test('getAvailablePackagesStatus returns ready state', async ({ api }) => {
        const { response, json } = await api.post('packages', 'getAvailablePackagesStatus');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('completed');
        expect(typeof json.completed).toBe('boolean');
    });

    test('getInstalledPackagesStatus returns status', async ({ api }) => {
        const { response, json } = await api.post('packages', 'getInstalledPackagesStatus');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('completed');
    });
});
