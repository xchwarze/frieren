/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 *
 * Adapted from frieren-modules-private/evilportal/vitest.config.js.
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// @src/@common resolve to the same shared SDK the production build uses (VITE_COMMON_ALIAS,
// see vite.config.js) — a component NOT explicitly mocked in vitest.setup.jsx still renders
// for real instead of failing to resolve. Keep component tests on the module's own React copy
// (dedupe) so a real @common component and the module never load two different React instances.
const COMMON_ALIAS = process.env.VITE_COMMON_ALIAS || '../frieren-front/src';

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom', 'react-bootstrap'],
        alias: {
            '@module': path.resolve(__dirname, './src'),
            '@src': path.resolve(__dirname, COMMON_ALIAS),
            '@common': path.resolve(__dirname, COMMON_ALIAS),
            // Pin react/react-dom to this module's own node_modules explicitly, on top of
            // `dedupe` below — belt-and-suspenders against a real @common component (which
            // resolves COMMON_ALIAS may point outside this module) loading a second React copy.
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
        extensions: ['.js', '.jsx', '.json'],
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.jsx'],
        // .js AND .jsx on purpose — a pure-logic test (e.g. queryKeys) shouldn't be forced
        // into a .jsx filename just to be discovered.
        include: ['src/**/*.test.{js,jsx}'],
    },
});
