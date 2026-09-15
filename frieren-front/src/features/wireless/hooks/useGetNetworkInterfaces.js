/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_NETWORK_INTERFACES } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a hook with the device's configured UCI network interfaces, reused by the
 * Add/Edit Interface form to populate the "Network" select. Reuses the `network` module's
 * own `getInterfaces` action (feature isolation: the wireless feature owns this hook/query
 * key even though the action lives in the `network` backend module).
 *
 * @param {{ enabled?: Boolean }} [options] - Passthrough options forwarded to `useQuery`.
 * @return {Object} The result of the query.
 */
const useGetNetworkInterfaces = ({ enabled } = {}) => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_NETWORK_INTERFACES],
        queryFn: () => fetchPost({
            module: 'network',
            action: 'getInterfaces',
        }),
        enabled,
    })
);

export default useGetNetworkInterfaces;
