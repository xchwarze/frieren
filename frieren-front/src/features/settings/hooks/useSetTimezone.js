/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Generates a custom hook for setting the timezone.
 *
 * @return {Function} The mutation hook.
 */
const useSetTimezone = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ timezone }) => fetchPost({
            module: 'settings',
            action: 'setTimezone',
            timezone,
        }),
        onSuccess: () => {
            toast.success('Timezone updated');
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
        onError: () => {
            toast.error('Failed to update timezone');
        },
    });
};

export default useSetTimezone;
