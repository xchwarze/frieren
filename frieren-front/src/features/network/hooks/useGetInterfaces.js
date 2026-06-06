/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a query hook with the list of network interfaces and their state.
 *
 * @return {Object} The query object.
 */
const useGetInterfaces = () => useAuthenticatedQuery({
    queryKey: [NETWORK_GET_INTERFACES],
    queryFn: () => fetchPost({
        module: 'network',
        action: 'getInterfaces',
    }),
});

export default useGetInterfaces;
