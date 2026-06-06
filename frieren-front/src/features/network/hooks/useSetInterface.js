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
 * Returns a mutation hook to update a network interface configuration.
 *
 * @return {Object} The mutation object.
 */
const useSetInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name, proto, ipaddr, netmask, gateway, dns }) => fetchPost({
            module: 'network',
            action: 'setInterface',
            name,
            proto,
            ipaddr,
            netmask,
            gateway,
            // Backend expects dns as an array; the form holds a space/comma-separated string.
            dns: Array.isArray(dns) ? dns : (dns || '').split(/[\s,]+/).filter(Boolean),
        }),
        onSuccess: (data, { name }) => {
            toast.success(`${name} updated`);
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_INTERFACES] });
        },
        onError: () => {
            toast.error('Failed to update interface');
        },
    });
};

export default useSetInterface;
