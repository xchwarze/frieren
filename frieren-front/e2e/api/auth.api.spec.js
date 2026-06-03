import { test, expect } from './api-fixture.js';

test.describe('API: Auth', () => {
    test('login with valid credentials returns success', async ({ api }) => {
        const { response, json } = await api.post('login', 'login', {
            username: process.env.FRIEREN_USER || 'root',
            password: process.env.FRIEREN_PASS || 'root',
        });
        expect(response.ok()).toBeTruthy();
        expect(json.success).toBe(true);
    });

    test('login with invalid credentials returns error', async ({ api }) => {
        const { response, json } = await api.post('login', 'login', {
            username: 'invalid',
            password: 'wrong',
        });
        expect(json).toHaveProperty('error');
    });

    test('server ping returns success', async ({ api }) => {
        const { response, json } = await api.post('header', 'serverPing');
        expect(response.ok()).toBeTruthy();
        expect(json.success).toBe(true);
    });
});
