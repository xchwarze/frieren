/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_ARP_TABLE } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a query hook with the ARP/neighbor table.
 *
 * @return {Object} The query object.
 */
const useGetArpTable = () => useAuthenticatedQuery({
    queryKey: [NETWORK_GET_ARP_TABLE],
    queryFn: () => fetchPost({
        module: 'network',
        action: 'getArpTable',
    }),
});

export default useGetArpTable;
