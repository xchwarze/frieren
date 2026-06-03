import { test as base, expect } from '@playwright/test';
import { mockApi, mockApiWithOverrides } from '../fixtures/api-mocks.js';

export const test = base.extend({
    mockPage: async ({ page }, use) => {
        await mockApi(page);
        await use(page);
    },
});

export { expect, mockApi, mockApiWithOverrides };
