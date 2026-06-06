/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_STATIC_LEASES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a query hook with the configured static DHCP leases.
 *
 * @return {Object} The query object.
 */
const useGetStaticLeases = () => useAuthenticatedQuery({
    queryKey: [NETWORK_GET_STATIC_LEASES],
    queryFn: () => fetchPost({
        module: 'network',
        action: 'getStaticLeases',
    }),
});

export default useGetStaticLeases;
