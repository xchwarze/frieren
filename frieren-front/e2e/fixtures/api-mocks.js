/**
 * API mock layer for offline/CI E2E testing.
 *
 * Responses captured from live device via:
 *   yarn test:api:record
 *
 * Usage in tests:
 *   import { mockApi } from '../fixtures/api-mocks.js';
 *   test.beforeEach(async ({ page }) => { await mockApi(page); });
 *
 * Selective mocking:
 *   await mockApi(page, ['dashboard', 'login']);
 *
 * Override with custom status codes:
 *   await mockApiWithOverrides(page, {
 *       login: { login: { __status: 400, error: 'Not logged_in' } },
 *   });
 */

import { readFileSync } from 'fs';

let _cached = null;

function loadRecordedResponses() {
    if (_cached) return _cached;
    const raw = readFileSync(new URL('./recorded-responses.json', import.meta.url), 'utf-8');
    _cached = JSON.parse(raw);
    return _cached;
}

function fulfillMock(route, data) {
    if (Array.isArray(data)) {
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(data),
        });
    }

    const status = data?.__status || 200;
    const { __status, ...body } = data;
    return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
    });
}

export function getMockResponses() {
    return loadRecordedResponses();
}

export async function mockApi(page, modules = null) {
    const responses = loadRecordedResponses();

    await page.route('**/api/index.php', async (route) => {
        const request = route.request();
        let body;
        try {
            body = JSON.parse(request.postData());
        } catch {
            return route.abort('failed');
        }

        const { module, action } = body;
        const allowed = modules || Object.keys(responses);

        if (allowed.includes(module) && responses[module]?.[action] !== undefined) {
            return fulfillMock(route, responses[module][action]);
        }

        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{}',
        });
    });
}

export async function mockApiWithOverrides(page, overrides = {}) {
    const responses = loadRecordedResponses();
    const merged = { ...responses };
    for (const [mod, actions] of Object.entries(overrides)) {
        merged[mod] = { ...merged[mod], ...actions };
    }

    await page.route('**/api/index.php', async (route) => {
        const request = route.request();
        let body;
        try {
            body = JSON.parse(request.postData());
        } catch {
            return route.abort('failed');
        }

        const { module, action } = body;
        if (merged[module]?.[action] !== undefined) {
            return fulfillMock(route, merged[module][action]);
        }

        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '{}',
        });
    });
}
