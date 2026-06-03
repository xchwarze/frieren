import { test, expect } from './api-fixture.js';

test.describe('API: Modules', () => {
    test('getModuleList returns sidebar and external modules', async ({ api }) => {
        const { response, json } = await api.post('modules', 'getModuleList');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('sidebar');
        expect(json).toHaveProperty('external');
        expect(Array.isArray(json.sidebar)).toBe(true);
        expect(Array.isArray(json.external)).toBe(true);
    });

    test('getInstalledModules returns modules with metadata', async ({ api }) => {
        const { response, json } = await api.post('modules', 'getInstalledModules');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(Array.isArray(json)).toBe(true);

        if (json.length > 0) {
            const mod = json[0];
            expect(mod).toHaveProperty('name');
            expect(mod).toHaveProperty('title');
            expect(mod).toHaveProperty('version');
            expect(mod).toHaveProperty('author');
            expect(mod).toHaveProperty('size');
        }
    });

    test('getAvailableModules returns remote catalog', async ({ api }) => {
        const { response, json } = await api.post('modules', 'getAvailableModules');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
    });

    test('checkDestination returns storage info', async ({ api }) => {
        const { response, json } = await api.post('modules', 'checkDestination', {
            moduleName: 'test-module',
            moduleSize: 1024,
        });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('alreadyInstalled');
        expect(json).toHaveProperty('isInternalAvailable');
        expect(json).toHaveProperty('isSDAvailable');
    });
});
