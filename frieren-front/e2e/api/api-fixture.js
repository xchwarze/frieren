import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const API_PATH = '/api/index.php';
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadSession() {
    const raw = readFileSync(resolve(__dirname, '../.auth/session.json'), 'utf-8');
    const state = JSON.parse(raw);
    const cookies = {};
    for (const c of state.cookies) {
        cookies[c.name] = c.value;
    }
    return cookies;
}

export const test = base.extend({
    api: async ({ playwright }, use) => {
        const cookies = loadSession();
        const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
        const xsrfToken = cookies['XSRF-TOKEN'] || '';

        const context = await playwright.request.newContext({
            baseURL: process.env.BASE_URL || 'http://192.168.7.1:5000',
            extraHTTPHeaders: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
                'X-XSRF-TOKEN': xsrfToken,
            },
        });

        const post = async (module, action, params = {}) => {
            const response = await context.post(API_PATH, {
                data: { module, action, ...params },
            });
            const text = await response.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch {
                json = { error: `Non-JSON response: ${text.slice(0, 200)}` };
            }
            return { response, json };
        };

        await use({ context, post });
        await context.dispose();
    },
});

export { expect };
