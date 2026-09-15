/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Unlike its install/remove siblings, this hook owns no completion side effect of its own —
 * it just forwards the caller's `onCompleted` straight through to useBackgroundTask. The
 * forwarding test below is what would catch a copy-paste regression that wraps it or drops it.
 */
import { renderHook } from '@testing-library/react';

import useUpdateLists from '@src/features/packages/hooks/useUpdateLists.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/hooks/useBackgroundTask.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));

const start = vi.fn();
const mutate = vi.fn();

describe('useUpdateLists', () => {
    beforeEach(() => {
        start.mockReset();
        mutate.mockReset();
        useBackgroundTask.mockReturnValue({ isRunning: false, start });
        useAuthenticatedMutation.mockReturnValue({ mutate, isPending: false });
    });

    it('forwards the caller-provided onCompleted straight to the background task, unmodified', () => {
        const onCompleted = vi.fn();
        renderHook(() => useUpdateLists({ onCompleted }));

        const passedOptions = useBackgroundTask.mock.calls.at(-1)[0];
        passedOptions.onCompleted({ completed: true });

        expect(onCompleted).toHaveBeenCalledWith({ completed: true });
    });

    it('starts polling when the trigger response reports success', () => {
        renderHook(() => useUpdateLists());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        onSuccess({ success: true });

        expect(start).toHaveBeenCalledTimes(1);
    });

    it('does not start polling when the trigger response reports failure', () => {
        renderHook(() => useUpdateLists());
        const { onSuccess } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        onSuccess({ success: false });

        expect(start).not.toHaveBeenCalled();
    });

    it('triggers the fetch with the exact packages/updateLists contract', async () => {
        fetchPost.mockResolvedValue({ success: true });
        renderHook(() => useUpdateLists());
        const { mutationFn } = useAuthenticatedMutation.mock.calls.at(-1)[0];

        await mutationFn();

        expect(fetchPost).toHaveBeenCalledWith({ module: 'packages', action: 'updateLists' });
    });
});
