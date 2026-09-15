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
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a mutation hook to delete a network interface by name.
 *
 * @return {Object} The mutation object.
 */
const useRemoveInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name }) => fetchPost({
            module: 'network',
            action: 'removeInterface',
            name,
        }),
        onSuccess: (data, { name }) => {
            toast.success(`${name} removed`);
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_INTERFACES] });
        },
        onError: () => {
            toast.error('Failed to remove interface');
        },
    });
};

export default useRemoveInterface;
