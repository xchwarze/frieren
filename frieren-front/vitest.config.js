/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 *
 * Unit/component tests (Vitest) for this app's own hooks/components/helpers — complementary
 * to the existing Playwright suites in e2e/ (e2e/api/mock, integration-level, run separately
 * via `yarn test:e2e`/`test:api`/`test:mock`). This is the host app itself, so @src/@module
 * both resolve to its own ./src (mirroring vite.config.js) — nothing here needs mocking to
 * satisfy an external SDK the way a third-party module's tests do.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, './src'),
            '@module': path.resolve(__dirname, './src'),
        },
    },
    // A fixed, real-looking semver so helpers/versionHelper.js's PANEL_VERSION has something
    // meaningful to compare against in tests (vite.config.js normally injects this from
    // package.json at build time; that define{} block isn't part of this config).
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.4.1'),
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.js'],
        include: ['tests-js/**/*.test.{js,jsx}'],
    },
});
