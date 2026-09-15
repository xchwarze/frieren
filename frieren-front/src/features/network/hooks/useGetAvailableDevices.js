/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_AVAILABLE_DEVICES } from '@src/features/network/helpers/queryKeys.js';

/**
 * Returns a query hook with the live list of network devices (kernel netdevs/bridges)
 * a new interface can attach to. Only mounted by the add-interface field (the edit
 * form doesn't touch device), so no extra `enabled` gating is needed here.
 *
 * @return {Object} The query object.
 */
const useGetAvailableDevices = () => useAuthenticatedQuery({
    queryKey: [NETWORK_GET_AVAILABLE_DEVICES],
    queryFn: () => fetchPost({
        module: 'network',
        action: 'getAvailableDevices',
    }),
});

export default useGetAvailableDevices;
