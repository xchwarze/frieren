import { test as setup } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

setup('mock-authenticate', async () => {
    const mockState = {
        cookies: [
            {
                name: 'PHPSESSID',
                value: 'mock-session-id',
                domain: 'localhost',
                path: '/',
                expires: -1,
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
            },
            {
                name: 'XSRF-TOKEN',
                value: 'mock-xsrf-token',
                domain: 'localhost',
                path: '/',
                expires: -1,
                httpOnly: false,
                secure: false,
                sameSite: 'Lax',
            },
        ],
        origins: [
            {
                origin: process.env.DEV_URL || 'http://localhost:5173',
                localStorage: [
                    { name: 'user-logged', value: 'true' },
                ],
            },
        ],
    };

    mkdirSync('./e2e/.auth', { recursive: true });
    writeFileSync('./e2e/.auth/mock-session.json', JSON.stringify(mockState, null, 2));
});
