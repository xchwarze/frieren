/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import terminalSettingsAtom from '@src/features/terminal/atoms/terminalSettingsAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Returns a mutation hook for opening a terminal.
 * On success, syncs terminal settings from the backend response into the local atom.
 *
 * @return {Function} The mutation hook.
 */
const useOpenTerminalMutation = () => {
    const setTerminalStatus = useSetAtom(terminalStatusAtom);
    const setTerminalSettings = useSetAtom(terminalSettingsAtom);

    return useAuthenticatedMutation({
        mutationFn: () => (
            fetchPost({
                module: 'terminal',
                action: 'startTerminal',
            })
        ),
        onSuccess: ({ success, terminalTheme, fontSize, cursorStyle, cursorBlink }) => {
            if (success) {
                setTerminalSettings({
                    terminalTheme,
                    fontSize,
                    cursorStyle,
                    cursorBlink,
                });
                setTerminalStatus(true);
            } else {
                toast.error('The console could not be started. See the logs for more information.');
            }
        },
    });
};

export default useOpenTerminalMutation;
