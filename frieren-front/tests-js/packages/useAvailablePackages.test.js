/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `isLoaded` seeds itself from the atom's current length so a remounted card (e.g. switching
 * tabs away and back) doesn't flash the "Update Lists" prompt over packages it already has
 * cached — it only goes false again once a fresh update trigger fires. useAuthenticatedMutation
 * and useBackgroundTask are mocked at the boundary; their onSuccess/onCompleted callbacks are
 * captured and invoked directly to drive the hook's own wiring.
 */
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import useAvailablePackages from '@src/features/packages/hooks/useAvailablePackages.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/hooks/useBackgroundTask.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));

const store = getDefaultStore();
const start = vi.fn();
const mutate = vi.fn();

describe('useAvailablePackages', () => {
    beforeEach(() => {
        store.set(availablePackagesAtom, []);
        start.mockReset();
        mutate.mockReset();
        useBackgroundTask.mockReturnValue({ isRunning: false, start });
        useAuthenticatedMutation.mockReturnValue({ mutate, isPending: false });
    });

    it('starts unloaded when the atom has no cached packages yet', () => {
        const { result } = renderHook(() => useAvailablePackages());

        expect(result.current.isLoaded).toBe(false);
    });

    it('starts loaded already when the atom still holds packages from a previous mount', () => {
        store.set(availablePackagesAtom, [{ name: 'curl' }]);

        const { result } = renderHook(() => useAvailablePackages());

        expect(result.current.isLoaded).toBe(true);
    });

    it('stores the polled packages and marks loaded once the background task completes', () => {
        const { result } = renderHook(() => useAvailablePackages());
        const { onCompleted } = useBackgroundTask.mock.calls.at(-1)[0];

        act(() => onCompleted({ packages: [{ name: 'wget' }] }));

        expect(store.get(availablePackagesAtom)).toEqual([{ name: 'wget' }]);
        expect(result.current.isLoaded).toBe(true);
    });

    it('defaults to an empty array when the completed task reports no packages field', () => {
        renderHook(() => useAvailablePackages());
        const { onCompleted } = useBackgroundTask.mock.calls.at(-1)[0];

        act(() => onCompleted({}));

        expect(store.get(availablePackagesAtom)).toEqual([]);
    });

    it('on a successful trigger, clears isLoaded and starts polling', () => {
        store.set(availablePackagesAtom, [{ name: 'curl' }]);
        const { result } = renderHook(() => useAvailablePackages());
        expect(result.current.isLoaded).toBe(true);

        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];
        act(() => onSuccess({ success: true }));

        expect(start).toHaveBeenCalledTimes(1);
        expect(result.current.isLoaded).toBe(false);
    });

    it('does not start polling when the trigger response reports failure', () => {
        renderHook(() => useAvailablePackages());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        act(() => onSuccess({ success: false }));

        expect(start).not.toHaveBeenCalled();
    });

    it('triggers the fetch with the exact packages/getAvailablePackages contract', async () => {
        fetchPost.mockResolvedValue({ success: true });
        renderHook(() => useAvailablePackages());
        const { mutationFn } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        await mutationFn();

        expect(fetchPost).toHaveBeenCalledWith({ module: 'packages', action: 'getAvailablePackages' });
    });
});
