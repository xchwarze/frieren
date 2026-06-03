import { test, expect } from './api-fixture.js';

test.describe('API: Dashboard', () => {
    test('getSystemStats returns CPU, memory, swap, uptime', async ({ api }) => {
        const { response, json } = await api.post('dashboard', 'getSystemStats');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('cpu_usage');
        expect(json).toHaveProperty('memory_used');
        expect(json).toHaveProperty('swap_used');
        expect(json).toHaveProperty('uptime');
        expect(json).toHaveProperty('cpu_cores');
        expect(typeof json.cpu_cores).toBe('number');
    });

    test('getSystemResume returns device info', async ({ api }) => {
        const { response, json } = await api.post('dashboard', 'getSystemResume');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('hostname');
        expect(json).toHaveProperty('model');
        expect(json).toHaveProperty('system');
        expect(json).toHaveProperty('kernel');
        expect(json).toHaveProperty('release');
        expect(json.release).toHaveProperty('version');
        expect(json.release).toHaveProperty('target');
        expect(json.hostname.length).toBeGreaterThan(0);
        expect(json.model.length).toBeGreaterThan(0);
    });

    test('getNews returns news array', async ({ api }) => {
        const { response, json } = await api.post('dashboard', 'getNews');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('news');
        expect(Array.isArray(json.news)).toBe(true);

        if (json.news.length > 0) {
            const entry = json.news[0];
            expect(entry).toHaveProperty('date');
            expect(entry).toHaveProperty('title');
            expect(entry).toHaveProperty('description');
        }
    });
});
