/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The completion toast reads `installingName` through a ref-backed closure passed to
 * useBackgroundTask (see useBackgroundTask.js's onCompletedRef) specifically so it names the
 * package that finished, not a stale one from a prior render. The toast-content assertion below
 * is what would catch a regression to a plain (non-ref) closure over a stale name.
 */
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { toast } from 'react-toastify';

import useInstallPackage from '@src/features/packages/hooks/useInstallPackage.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/hooks/useBackgroundTask.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn() } }));

const store = getDefaultStore();
const start = vi.fn();
const mutate = vi.fn();

describe('useInstallPackage', () => {
    beforeEach(() => {
        store.set(reloadPackagesAtom, 0);
        start.mockReset();
        mutate.mockReset();
        toast.success.mockReset();
        useBackgroundTask.mockReturnValue({ isRunning: false, start });
        useAuthenticatedMutation.mockReturnValue({ mutate, isPending: false });
    });

    it('captures the installing package name and starts polling on a successful trigger', () => {
        const { result } = renderHook(() => useInstallPackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        act(() => onSuccess({ success: true }, { packageName: 'curl' }));

        expect(start).toHaveBeenCalledTimes(1);
        expect(result.current.installingName).toBe('curl');
    });

    it('ignores a trigger response that reports failure', () => {
        const { result } = renderHook(() => useInstallPackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        act(() => onSuccess({ success: false }, { packageName: 'curl' }));

        expect(start).not.toHaveBeenCalled();
        expect(result.current.installingName).toBe('');
    });

    it('on completion, toasts the name of the package that just finished, clears it, and bumps the reload signal', () => {
        const { result } = renderHook(() => useInstallPackage());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];
        act(() => onSuccess({ success: true }, { packageName: 'curl' }));

        const { onCompleted } = useBackgroundTask.mock.calls.at(-1)[0];
        act(() => onCompleted());

        expect(toast.success).toHaveBeenCalledWith('Package curl successfully installed');
        expect(result.current.installingName).toBe('');
        expect(store.get(reloadPackagesAtom)).toBe(1);
    });

    it('triggers the fetch with the exact packages/installPackage contract', async () => {
        fetchPost.mockResolvedValue({ success: true });
        renderHook(() => useInstallPackage());
        const { mutationFn } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        await mutationFn({ packageName: 'curl' });

        expect(fetchPost).toHaveBeenCalledWith({ module: 'packages', action: 'installPackage', packageName: 'curl' });
    });
});
