/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Pure logic, no rendering. Fixed system time via vi.setSystemTime so the relative-vs-absolute
 * boundary (60s / 3600s) is deterministic regardless of when the suite actually runs.
 */
import { timeSinceEpoch } from '@src/helpers/dateHelper.js';

const NOW = new Date('2026-01-01T12:00:00Z');

describe('timeSinceEpoch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns an empty string for undefined or null', () => {
        expect(timeSinceEpoch(undefined)).toBe('');
        expect(timeSinceEpoch(null)).toBe('');
    });

    it('formats a moment within the last minute in seconds', () => {
        const epoch = NOW.getTime() / 1000 - 30;
        expect(timeSinceEpoch(epoch)).toMatch(/second/);
    });

    it('formats a moment within the last hour in minutes', () => {
        const epoch = NOW.getTime() / 1000 - 300;
        expect(timeSinceEpoch(epoch)).toMatch(/minute/);
    });

    it('falls back to an absolute date/time past the one-hour boundary', () => {
        const epoch = NOW.getTime() / 1000 - 7200;
        const result = timeSinceEpoch(epoch);
        expect(result).not.toMatch(/minute|second/);
        expect(result.length).toBeGreaterThan(0);
    });

    it('handles a future timestamp the same way (relative, then absolute)', () => {
        const soon = NOW.getTime() / 1000 + 30;
        expect(timeSinceEpoch(soon)).toMatch(/second/);
    });
});
