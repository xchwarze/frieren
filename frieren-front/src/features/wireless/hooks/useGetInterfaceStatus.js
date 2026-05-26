/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_INTERFACE_STATUS } from '@src/features/wireless/helpers/queryKeys.js';

const POLL_INTERVAL = 1500;

/**
 * Polls the runtime status of a wireless interface after a config change.
 * For STA: stops on COMPLETED. For AP/monitor: stops on UP.
 *
 * @param {string|null} section UCI section name to check.
 * @return {Object} The query result with interface status data.
 */
const useGetInterfaceStatus = (section) => {
    return useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_INTERFACE_STATUS, section],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getInterfaceStatus',
            section,
        }),
        staleTime: 0,
        gcTime: 0,
        refetchInterval: (query) => {
            const state = query.state.data?.state;
            if (state === 'COMPLETED' || state === 'UP') {
                return false;
            }
            return POLL_INTERVAL;
        },
        enabled: !!section,
    });
};

export default useGetInterfaceStatus;
