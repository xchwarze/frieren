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
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a mutation hook to bring a network interface up or down.
 *
 * @return {Object} The mutation object.
 */
const useToggleInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        // The backend routes on `action`, so the contract's `action: 'up'|'down'`
        // param is forwarded under `state` to avoid colliding with the endpoint name.
        mutationFn: ({ name, action }) => fetchPost({
            module: 'network',
            action: 'toggleInterface',
            name,
            state: action,
        }),
        onSuccess: async (data, { name, action }) => {
            toast.success(`${name} brought ${action}`);
            await sleep(1500);
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_INTERFACES] });
        },
        onError: () => {
            toast.error('Failed to toggle interface');
        },
    });
};

export default useToggleInterface;
