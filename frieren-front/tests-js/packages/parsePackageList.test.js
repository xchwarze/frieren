/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import parsePackageList from '@src/features/packages/helpers/parsePackageList.js';

describe('parsePackageList', () => {
    it('returns an empty array for falsy input', () => {
        expect(parsePackageList('')).toEqual([]);
        expect(parsePackageList(null)).toEqual([]);
        expect(parsePackageList(undefined)).toEqual([]);
    });

    it('parses a name/version/description line, trimming each field', () => {
        expect(parsePackageList('  curl - 8.4.0-1  -  Command line tool for transferring data  ')).toEqual([
            { name: 'curl', version: '8.4.0-1', description: 'Command line tool for transferring data' },
        ]);
    });

    it('defaults description to an empty string when only name and version are present', () => {
        expect(parsePackageList('curl - 8.4.0-1')).toEqual([
            { name: 'curl', version: '8.4.0-1', description: '' },
        ]);
    });

    it('rejoins a description that itself contains " - " instead of truncating it', () => {
        expect(parsePackageList('curl - 8.4.0-1 - HTTP client - supports TLS')).toEqual([
            { name: 'curl', version: '8.4.0-1', description: 'HTTP client - supports TLS' },
        ]);
    });

    it('skips lines with no " - " separator, such as a trailing blank line', () => {
        const raw = 'curl - 8.4.0-1 - HTTP client\nnot a package line\n';

        expect(parsePackageList(raw)).toEqual([
            { name: 'curl', version: '8.4.0-1', description: 'HTTP client' },
        ]);
    });

    it('parses every line of a multi-line list independently', () => {
        const raw = [
            'curl - 8.4.0-1 - HTTP client',
            'wget - 1.21.3-1',
        ].join('\n');

        expect(parsePackageList(raw)).toEqual([
            { name: 'curl', version: '8.4.0-1', description: 'HTTP client' },
            { name: 'wget', version: '1.21.3-1', description: '' },
        ]);
    });
});
