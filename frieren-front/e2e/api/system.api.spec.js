import { test, expect } from './api-fixture.js';

test.describe('API: System', () => {
    test('getUsbDevices returns device list', async ({ api }) => {
        const { response, json } = await api.post('system', 'getUsbDevices');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(Array.isArray(json)).toBe(true);

        if (json.length > 0) {
            const device = json[0];
            expect(device).toHaveProperty('bus');
            expect(device).toHaveProperty('device');
            expect(device).toHaveProperty('id');
            expect(device).toHaveProperty('name');
        }
    });

    test('getFileSystemUsage returns filesystem data', async ({ api }) => {
        const { response, json } = await api.post('system', 'getFileSystemUsage');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBeGreaterThan(0);

        const fs = json[0];
        expect(fs).toHaveProperty('filesystem');
        expect(fs).toHaveProperty('type');
        expect(fs).toHaveProperty('size');
        expect(fs).toHaveProperty('used');
        expect(fs).toHaveProperty('available');
        expect(fs).toHaveProperty('usePercent');
        expect(fs).toHaveProperty('mountedOn');
    });

    test('getSystemLogs returns structured log entries', async ({ api }) => {
        const { response, json } = await api.post('system', 'getSystemLogs');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBeGreaterThan(0);

        const entry = json[0];
        expect(entry).toHaveProperty('message');
        expect(entry).toHaveProperty('process');
        expect(entry).toHaveProperty('tag');
        expect(entry).toHaveProperty('timestamp');
    });

    test('getSystemLogs with search filter works', async ({ api }) => {
        const { response, json } = await api.post('system', 'getSystemLogs', {
            search: 'kern',
        });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(Array.isArray(json)).toBe(true);
    });

    test('getServices returns init.d services with boot/running state', async ({ api }) => {
        const { response, json } = await api.post('system', 'getServices');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('services');
        expect(Array.isArray(json.services)).toBe(true);
        expect(json.services.length).toBeGreaterThan(0);

        const service = json.services[0];
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('enabled');
        expect(service).toHaveProperty('running');
        expect(typeof service.enabled).toBe('boolean');
        expect(typeof service.running).toBe('boolean');
    });
});
