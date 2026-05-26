/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import themeVariantAtom from '@src/atoms/themeVariantAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Function to set the panel theme using an authenticated mutation.
 *
 * @return {Function} The mutation hook.
 */
const useSetPanelTheme = () => {
    const queryClient = useQueryClient();
    const setThemeVariant = useSetAtom(themeVariantAtom);

    return useAuthenticatedMutation({
        mutationFn: ({ theme }) => fetchPost({
            module: 'settings',
            action: 'setPanelTheme',
            theme,
        }),
        onSuccess: (data, { theme }) => {
            setThemeVariant(theme);
            toast.success('Theme updated');
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
        onError: () => {
            toast.error('Failed to update theme');
        },
    })
};

export default useSetPanelTheme;
