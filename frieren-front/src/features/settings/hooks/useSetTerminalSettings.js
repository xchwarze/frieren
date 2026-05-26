/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import terminalSettingsAtom from '@src/features/terminal/atoms/terminalSettingsAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Hook to save all terminal settings in a single request.
 *
 * @return {Function} The mutation hook.
 */
const useSetTerminalSettings = () => {
    const queryClient = useQueryClient();
    const setTerminalSettings = useSetAtom(terminalSettingsAtom);

    return useAuthenticatedMutation({
        mutationFn: ({ terminalTheme, fontSize, cursorStyle, cursorBlink, terminalAutologin }) => fetchPost({
            module: 'settings',
            action: 'setTerminalSettings',
            terminalTheme,
            fontSize,
            cursorStyle,
            cursorBlink,
            terminalAutologin,
        }),
        onSuccess: (data, { terminalTheme, fontSize, cursorStyle, cursorBlink }) => {
            setTerminalSettings({ terminalTheme, fontSize, cursorStyle, cursorBlink });
            toast.success('Terminal settings updated');
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
        onError: () => {
            toast.error('Failed to update terminal settings');
        },
    });
};

export default useSetTerminalSettings;
