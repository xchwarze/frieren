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
 * Returns a mutation hook to add a static DHCP lease.
 *
 * @return {Object} The mutation object.
 */
const useAddStaticLease = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name, mac, ip }) => fetchPost({
            module: 'network',
            action: 'addStaticLease',
            name,
            mac,
            ip,
        }),
        onSuccess: () => {
            toast.success('Static lease added');
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_STATIC_LEASES] });
        },
        onError: () => {
            toast.error('Failed to add static lease');
        },
    });
};

export default useAddStaticLease;
