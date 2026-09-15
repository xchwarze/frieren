/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { getSignalVariant } from '@src/features/wireless/helpers/signalHelper.js';

describe('getSignalVariant', () => {
    it('returns success at and above the -60 dBm threshold', () => {
        expect(getSignalVariant(-60)).toBe('success');
        expect(getSignalVariant(-40)).toBe('success');
    });

    it('returns warning just below the success threshold and down to -75 dBm', () => {
        expect(getSignalVariant(-61)).toBe('warning');
        expect(getSignalVariant(-75)).toBe('warning');
    });

    it('returns danger below the -75 dBm threshold', () => {
        expect(getSignalVariant(-76)).toBe('danger');
        expect(getSignalVariant(-100)).toBe('danger');
    });

    it('parses numeric strings the same way as numbers', () => {
        expect(getSignalVariant('-65')).toBe('warning');
    });

    it('returns secondary for values that are not parseable as a number', () => {
        expect(getSignalVariant('N/A')).toBe('secondary');
        expect(getSignalVariant(undefined)).toBe('secondary');
        expect(getSignalVariant(null)).toBe('secondary');
    });
});
