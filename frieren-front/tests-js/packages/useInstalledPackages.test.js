/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The refetch-on-reload effect compares the reload signal to a ref seeded with its *initial*
 * value, specifically so a fresh mount never refetches on its own — only a later bump (from
 * useInstallPackage/useRemovePackage completing elsewhere) should. A naive `useEffect(...,
 * [reloadSignal])` with no such guard would refetch on mount too; the first case below would
 * catch that regression.
 */
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import useInstalledPackages from '@src/features/packages/hooks/useInstalledPackages.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';

vi.mock('@src/hooks/useAuthenticatedQuery.js', () => ({ default: vi.fn() }));

const store = getDefaultStore();
const refetch = vi.fn();

const baseQuery = { data: undefined, isSuccess: false, isFetching: false, isPending: true, refetch };

describe('useInstalledPackages', () => {
    beforeEach(() => {
        store.set(installedPackagesAtom, []);
        store.set(reloadPackagesAtom, 0);
        refetch.mockReset();
        useAuthenticatedQuery.mockReturnValue(baseQuery);
    });

    it('does not refetch on initial mount even though the reload signal already has a value', () => {
        store.set(reloadPackagesAtom, 3);

        renderHook(() => useInstalledPackages());

        expect(refetch).not.toHaveBeenCalled();
    });

    it('refetches only after the reload signal changes from its mount-time value', () => {
        renderHook(() => useInstalledPackages());
        expect(refetch).not.toHaveBeenCalled();

        act(() => store.set(reloadPackagesAtom, (c) => c + 1));

        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('syncs a successful response into the installed packages atom', () => {
        useAuthenticatedQuery.mockReturnValue({ ...baseQuery, data: { packages: [{ name: 'curl' }] }, isSuccess: true, isPending: false });

        const { result } = renderHook(() => useInstalledPackages());

        expect(store.get(installedPackagesAtom)).toEqual([{ name: 'curl' }]);
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.isPending).toBe(false);
    });

    it('defaults to an empty array when a successful response carries no packages field', () => {
        useAuthenticatedQuery.mockReturnValue({ ...baseQuery, data: {}, isSuccess: true, isPending: false });

        renderHook(() => useInstalledPackages());

        expect(store.get(installedPackagesAtom)).toEqual([]);
    });

    it('leaves the atom untouched while the query has not yet succeeded', () => {
        store.set(installedPackagesAtom, [{ name: 'stale' }]);
        useAuthenticatedQuery.mockReturnValue({ ...baseQuery, isSuccess: false });

        renderHook(() => useInstalledPackages());

        expect(store.get(installedPackagesAtom)).toEqual([{ name: 'stale' }]);
    });

    it('exposes the query state under the hook\'s own names', () => {
        useAuthenticatedQuery.mockReturnValue({ ...baseQuery, isFetching: true, isPending: false, isSuccess: false });

        const { result } = renderHook(() => useInstalledPackages());

        expect(result.current.load).toBe(refetch);
        expect(result.current.isPolling).toBe(true);
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.isPending).toBe(false);
    });
});
