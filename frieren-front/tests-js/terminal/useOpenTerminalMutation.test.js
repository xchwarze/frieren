/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The hook's only real logic is its onSuccess branch: seed settings from the backend payload
 * and open the terminal only when `success` is true, otherwise toast an error and leave the
 * terminal closed. `useAuthenticatedMutation` is mocked at the boundary (as in
 * useStartDiagnosticsScript.test.js) so that branch is exercised directly.
 */
import { renderHook } from '@testing-library/react';
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import useOpenTerminalMutation from '@src/features/terminal/hooks/useOpenTerminalMutation.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import { fetchPost } from '@src/services/fetchService.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('jotai', () => ({ useSetAtom: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

const setTerminalStatus = vi.fn();
const setTerminalSettings = vi.fn();
const mutate = vi.fn();

describe('useOpenTerminalMutation', () => {
    let capturedOptions;

    beforeEach(() => {
        setTerminalStatus.mockReset();
        setTerminalSettings.mockReset();
        mutate.mockReset();
        fetchPost.mockReset();
        toast.error.mockReset();

        useSetAtom.mockImplementation((atom) => (
            atom === terminalStatusAtom ? setTerminalStatus : setTerminalSettings
        ));
        useAuthenticatedMutation.mockImplementation((options) => {
            capturedOptions = options;
            return { mutate };
        });
    });

    it('requests startTerminal from the terminal module', () => {
        renderHook(() => useOpenTerminalMutation());

        capturedOptions.mutationFn();

        expect(fetchPost).toHaveBeenCalledWith({ module: 'terminal', action: 'startTerminal' });
    });

    it('seeds terminal settings from the response and opens the terminal on success', () => {
        renderHook(() => useOpenTerminalMutation());

        capturedOptions.onSuccess({
            success: true,
            terminalTheme: 'dracula',
            fontSize: 16,
            cursorStyle: 'bar',
            cursorBlink: true,
        });

        expect(setTerminalSettings).toHaveBeenCalledWith({
            terminalTheme: 'dracula',
            fontSize: 16,
            cursorStyle: 'bar',
            cursorBlink: true,
        });
        expect(setTerminalStatus).toHaveBeenCalledWith(true);
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('shows an error toast and does not open the terminal when the backend reports failure', () => {
        renderHook(() => useOpenTerminalMutation());

        capturedOptions.onSuccess({ success: false });

        expect(toast.error).toHaveBeenCalledWith('The console could not be started. See the logs for more information.');
        expect(setTerminalStatus).not.toHaveBeenCalled();
        expect(setTerminalSettings).not.toHaveBeenCalled();
    });
});
