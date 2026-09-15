/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import sortModulesByName from '@src/features/modules/helpers/sortModulesByName.js';

describe('sortModulesByName', () => {
    it('returns a new array sorted by name ascending', () => {
        const modules = [{ name: 'zebra' }, { name: 'apple' }, { name: 'mango' }];

        expect(sortModulesByName(modules).map((module) => module.name)).toEqual(['apple', 'mango', 'zebra']);
    });

    it('does not mutate the input array', () => {
        const modules = [{ name: 'zebra' }, { name: 'apple' }];
        const originalOrder = modules.map((module) => module.name);

        sortModulesByName(modules);

        expect(modules.map((module) => module.name)).toEqual(originalOrder);
    });

    it('returns a new array reference even for an already-sorted input', () => {
        const modules = [{ name: 'apple' }, { name: 'zebra' }];

        expect(sortModulesByName(modules)).not.toBe(modules);
    });

    it('returns an empty array for empty input', () => {
        expect(sortModulesByName([])).toEqual([]);
    });
});
