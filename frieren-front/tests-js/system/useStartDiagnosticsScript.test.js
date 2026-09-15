/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The only real logic this hook owns is wiring: kick off the background poll on mutation
 * success, and surface the poll's isRunning flag as isPolling. `useBackgroundTask` and
 * `useAuthenticatedMutation` are mocked at the module boundary so that wiring is exercised
 * directly, without depending on their own (separately-owned) internals.
 */
import { renderHook } from '@testing-library/react';

import useStartDiagnosticsScript from '@src/features/system/hooks/useStartDiagnosticsScript.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';

vi.mock('@src/hooks/useBackgroundTask.js', () => ({ default: vi.fn() }));
vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));

const start = vi.fn();
const mutate = vi.fn();

describe('useStartDiagnosticsScript', () => {
    let capturedOnSuccess;

    beforeEach(() => {
        start.mockReset();
        mutate.mockReset();
        useBackgroundTask.mockReturnValue({ isRunning: false, start });
        useAuthenticatedMutation.mockImplementation(({ onSuccess }) => {
            capturedOnSuccess = onSuccess;
            return { mutate, isPending: false };
        });
    });

    it('starts the background poll only once the start-script mutation succeeds', () => {
        renderHook(() => useStartDiagnosticsScript());

        expect(start).not.toHaveBeenCalled();

        capturedOnSuccess();

        expect(start).toHaveBeenCalledTimes(1);
    });

    it('exposes the background task isRunning flag as isPolling', () => {
        useBackgroundTask.mockReturnValue({ isRunning: true, start });

        const { result } = renderHook(() => useStartDiagnosticsScript());

        expect(result.current.isPolling).toBe(true);
    });

    it('exposes the mutation mutate/isPending as-is', () => {
        useAuthenticatedMutation.mockImplementation(() => ({ mutate, isPending: true }));

        const { result } = renderHook(() => useStartDiagnosticsScript());

        expect(result.current.mutate).toBe(mutate);
        expect(result.current.isPending).toBe(true);
    });
});
