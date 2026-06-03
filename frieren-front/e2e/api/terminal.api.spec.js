import { test, expect } from './api-fixture.js';

test.describe('API: Terminal', () => {
    test('getStatus returns terminal running state', async ({ api }) => {
        const { response, json } = await api.post('terminal', 'getStatus');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('status');
        expect(typeof json.status).toBe('boolean');
    });
});
