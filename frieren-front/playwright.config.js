import { defineConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://192.168.7.1:5000';
const DEV_URL = process.env.DEV_URL || 'http://localhost:5173';

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    use: {
        baseURL: BASE_URL,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
        headless: true,
        viewport: { width: 1280, height: 720 },
        launchOptions: {
            executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Chromium\\Application\\chrome.exe',
        },
    },
    projects: [
        {
            name: 'setup',
            testMatch: /global-setup\.js/,
        },
        {
            name: 'e2e',
            dependencies: ['setup'],
            use: {
                storageState: './e2e/.auth/session.json',
            },
        },
        {
            name: 'api',
            dependencies: ['setup'],
            testMatch: /api\/.*\.spec\.js/,
            use: {
                storageState: './e2e/.auth/session.json',
            },
        },
        {
            name: 'mock-setup',
            testMatch: /mock-setup\.js/,
        },
        {
            name: 'mock',
            dependencies: ['mock-setup'],
            testMatch: /mock\/.*\.spec\.js/,
            use: {
                baseURL: DEV_URL,
                storageState: './e2e/.auth/mock-session.json',
            },
        },
    ],
});
