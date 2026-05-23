/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';

import terminalThemeAtom from '@src/features/terminal/atoms/terminalThemeAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Hook to save terminal settings (theme + autologin) in a single request.
 *
 * @return {Function} The mutation hook.
 */
const useSetTerminalSettings = () => {
    const queryClient = useQueryClient();
    const setTerminalTheme = useSetAtom(terminalThemeAtom);

    return useAuthenticatedMutation({
        mutationFn: ({ terminalTheme, terminalAutologin }) => fetchPost({
            module: 'settings',
            action: 'setTerminalSettings',
            terminalTheme,
            terminalAutologin,
        }),
        onSuccess: (data, { terminalTheme }) => {
            setTerminalTheme(terminalTheme);
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
    });
};

export default useSetTerminalSettings;
