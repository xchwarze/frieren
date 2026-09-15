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
 * Returns a mutation hook to create a new network interface.
 *
 * @return {Object} The mutation object.
 */
const useAddInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name, device, proto, ipaddr, netmask, gateway, dns, mtu, macaddr, peerdns }) => fetchPost({
            module: 'network',
            action: 'addInterface',
            name,
            device,
            proto,
            ipaddr,
            netmask,
            gateway,
            // Backend expects dns as an array; the form holds a space/comma-separated string.
            dns: Array.isArray(dns) ? dns : (dns || '').split(/[\s,]+/).filter(Boolean),
            mtu,
            macaddr,
            peerdns,
        }),
        onSuccess: (data, { name }) => {
            toast.success(`${name} created`);
            queryClient.invalidateQueries({ queryKey: [NETWORK_GET_INTERFACES] });
        },
        onError: () => {
            toast.error('Failed to create interface');
        },
    });
};

export default useAddInterface;
