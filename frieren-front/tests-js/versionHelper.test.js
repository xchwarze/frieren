/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Pure logic, no rendering — PANEL_VERSION is fixed to '1.4.1' by vitest.config.js's define{}.
 */
import { compareVersions, isPanelVersionSufficient, getPanelVersion } from '@src/helpers/versionHelper.js';

describe('compareVersions', () => {
    it('returns 1 when the first version is newer', () => {
        expect(compareVersions('1.5.0', '1.4.9')).toBe(1);
    });

    it('returns -1 when the first version is older', () => {
        expect(compareVersions('1.4.0', '1.4.1')).toBe(-1);
    });

    it('returns 0 for equal versions', () => {
        expect(compareVersions('1.4.1', '1.4.1')).toBe(0);
    });

    it('compares minor/patch, not just major', () => {
        expect(compareVersions('1.4.10', '1.4.9')).toBe(1);
        expect(compareVersions('1.10.0', '1.9.9')).toBe(1);
    });

    it('treats an unparseable side as 0.0.0', () => {
        expect(compareVersions('not-a-version', '0.0.1')).toBe(-1);
        expect(compareVersions('0.0.1', 'not-a-version')).toBe(1);
    });
});

describe('isPanelVersionSufficient', () => {
    it('is true when no minimum is required', () => {
        expect(isPanelVersionSufficient(undefined)).toBe(true);
        expect(isPanelVersionSufficient('')).toBe(true);
    });

    it('is true when the requirement is unparseable (fail-open, never block on a bad value)', () => {
        expect(isPanelVersionSufficient('not-a-real-version')).toBe(true);
    });

    it('is true when the running panel version (1.4.1) meets the requirement', () => {
        expect(isPanelVersionSufficient('1.4.0')).toBe(true);
        expect(isPanelVersionSufficient('1.4.1')).toBe(true);
    });

    it('is false when the running panel version is older than required', () => {
        expect(isPanelVersionSufficient('1.5.0')).toBe(false);
        expect(isPanelVersionSufficient('2.0.0')).toBe(false);
    });
});

describe('getPanelVersion', () => {
    it('returns the version injected via VITE_APP_VERSION', () => {
        expect(getPanelVersion()).toBe('1.4.1');
    });
});
