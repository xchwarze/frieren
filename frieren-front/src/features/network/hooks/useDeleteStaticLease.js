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
import { NETWORK_GET_STATIC_LEASES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a mutation hook to delete a static DHCP lease by MAC address.
 *
 * @return {Object} The mutation object.
 */
const useDeleteStaticLease = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ mac }) => fetchPost({
            module: 'network',
            action: 'deleteStaticLease',
            mac,
        }),
        onSuccess: () => {
            toast.success('Static lease removed');
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_STATIC_LEASES] });
        },
        onError: () => {
            toast.error('Failed to remove static lease');
        },
    });
};

export default useDeleteStaticLease;
