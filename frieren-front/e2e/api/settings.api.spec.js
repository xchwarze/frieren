import { test, expect } from './api-fixture.js';

test.describe('API: Settings', () => {
    test('getSectionData returns current config', async ({ api }) => {
        const { response, json } = await api.post('settings', 'getSectionData');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('hostname');
        expect(json).toHaveProperty('timezone');
        expect(json.hostname.length).toBeGreaterThan(0);
    });

    test('getSectionData hostname matches dashboard', async ({ api }) => {
        const settingsResp = await api.post('settings', 'getSectionData');
        const dashResp = await api.post('dashboard', 'getSystemResume');

        expect(settingsResp.json.hostname).toBe(dashResp.json.hostname);
    });
});
