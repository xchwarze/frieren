/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `useAuthenticatedMutation` is mocked at the boundary (as in useStartDiagnosticsScript.test.js)
 * so this exercises only the hook's own wiring: the stopTerminal request it builds, and the
 * atom resets its onSuccess performs. `useResetAtom` is mocked with an argument-keyed
 * implementation so the collapse and socket resets - both built from the same jotai/utils
 * import - can be told apart instead of colliding on one shared spy.
 */
import { renderHook } from '@testing-library/react';
import { useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';

import useCloseTerminalMutation from '@src/features/terminal/hooks/useCloseTerminalMutation.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import { fetchPost } from '@src/services/fetchService.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('jotai', () => ({ useSetAtom: vi.fn() }));
// terminalStatusAtom.js (imported for real alongside collapseStatusAtom/socketStatusAtom) needs
// jotai/utils' real atomWithStorage, so only useResetAtom is overridden here.
vi.mock('jotai/utils', async (importOriginal) => ({
    ...(await importOriginal()),
    useResetAtom: vi.fn(),
}));

const setTerminalStatus = vi.fn();
const collapseStatusReset = vi.fn();
const socketStatusReset = vi.fn();
const mutate = vi.fn();

describe('useCloseTerminalMutation', () => {
    let capturedOptions;

    beforeEach(() => {
        setTerminalStatus.mockReset();
        collapseStatusReset.mockReset();
        socketStatusReset.mockReset();
        mutate.mockReset();
        fetchPost.mockReset();

        useSetAtom.mockReturnValue(setTerminalStatus);
        useResetAtom.mockImplementation((atom) => (
            atom === collapseStatusAtom ? collapseStatusReset : socketStatusReset
        ));
        useAuthenticatedMutation.mockImplementation((options) => {
            capturedOptions = options;
            return { mutate };
        });
    });

    it('requests stopTerminal from the terminal module', () => {
        renderHook(() => useCloseTerminalMutation());

        capturedOptions.mutationFn();

        expect(fetchPost).toHaveBeenCalledWith({ module: 'terminal', action: 'stopTerminal' });
    });

    it('clears terminal status and resets collapse/socket status on success', () => {
        renderHook(() => useCloseTerminalMutation());

        capturedOptions.onSuccess();

        expect(setTerminalStatus).toHaveBeenCalledWith(false);
        expect(collapseStatusReset).toHaveBeenCalledTimes(1);
        expect(socketStatusReset).toHaveBeenCalledTimes(1);
    });

    it('exposes the mutate function from the underlying mutation', () => {
        const { result } = renderHook(() => useCloseTerminalMutation());

        expect(result.current.mutate).toBe(mutate);
    });
});
