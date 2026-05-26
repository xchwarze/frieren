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
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a mutation hook to enable or disable a wireless interface.
 *
 * @return {Object} The mutation object.
 */
const useToggleInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ section, disabled }) => fetchPost({
            module: 'wireless',
            action: 'toggleInterface',
            section,
            disabled,
        }),
        onSuccess: async (data, { disabled }) => {
            toast.success(disabled ? 'Interface disabled' : 'Interface enabled');
            await sleep(1500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW],
            });
        },
        onError: () => {
            toast.error('Failed to toggle interface');
        },
    });
};

export default useToggleInterface;
