/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Unlike useInstallPackage, the in-flight name here lives in a shared atom (removingPackageAtom)
 * rather than local state, because InstalledPackagesCard reads it to freeze every row's button
 * while one removal is in flight. `autoremove` also has a real default (false) worth pinning.
 */
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { toast } from 'react-toastify';

import useRemovePackage from '@src/features/packages/hooks/useRemovePackage.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';
import removingPackageAtom from '@src/features/packages/atoms/removingPackageAtom.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/hooks/useBackgroundTask.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn() } }));

const store = getDefaultStore();
const start = vi.fn();
const mutate = vi.fn();

describe('useRemovePackage', () => {
    beforeEach(() => {
        store.set(reloadPackagesAtom, 0);
        store.set(removingPackageAtom, '');
        start.mockReset();
        mutate.mockReset();
        toast.success.mockReset();
        useBackgroundTask.mockReturnValue({ isRunning: false, start });
        useAuthenticatedMutation.mockReturnValue({ mutate, isPending: false });
    });

    it('records the removing package name in the shared atom and starts polling on success', () => {
        renderHook(() => useRemovePackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        act(() => onSuccess({ success: true }, { packageName: 'curl' }));

        expect(start).toHaveBeenCalledTimes(1);
        expect(store.get(removingPackageAtom)).toBe('curl');
    });

    it('ignores a trigger response that reports failure', () => {
        renderHook(() => useRemovePackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        act(() => onSuccess({ success: false }, { packageName: 'curl' }));

        expect(start).not.toHaveBeenCalled();
        expect(store.get(removingPackageAtom)).toBe('');
    });

    it('on completion, toasts the removed name, clears the shared atom, and bumps the reload signal', () => {
        renderHook(() => useRemovePackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];
        act(() => onSuccess({ success: true }, { packageName: 'curl' }));

        const { onCompleted } = useBackgroundTask.mock.calls.at(-1)[0];
        act(() => onCompleted());

        expect(toast.success).toHaveBeenCalledWith('Package curl successfully removed');
        expect(store.get(removingPackageAtom)).toBe('');
        expect(store.get(reloadPackagesAtom)).toBe(1);
    });

    it('defaults autoremove to false when not provided', async () => {
        fetchPost.mockResolvedValue({ success: true });
        renderHook(() => useRemovePackage());
        const { mutationFn } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        await mutationFn({ packageName: 'curl' });

        expect(fetchPost).toHaveBeenCalledWith({ module: 'packages', action: 'removePackage', packageName: 'curl', autoremove: false });
    });

    it('forwards an explicit autoremove flag to the removePackage call', async () => {
        fetchPost.mockResolvedValue({ success: true });
        renderHook(() => useRemovePackage());
        const { mutationFn } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        await mutationFn({ packageName: 'curl', autoremove: true });

        expect(fetchPost).toHaveBeenCalledWith({ module: 'packages', action: 'removePackage', packageName: 'curl', autoremove: true });
    });
});
