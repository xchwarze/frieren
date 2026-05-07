/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_SCAN } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Continuously scans for wireless networks on the given radio device.
 * Refetches every 5 seconds while enabled.
 *
 * @param {string} device - Radio device name (e.g. 'radio0').
 * @param {boolean} enabled - Whether to start/continue scanning.
 * @return {Object} Query result.
 */
const useScanRadio = (device, enabled) => useAuthenticatedQuery({
    queryKey: [WIRELESS_SCAN, device],
    queryFn: () => fetchPost({
        module: 'wireless',
        action: 'scanForNetworks',
        device,
    }),
    enabled: enabled && !!device,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
});

export default useScanRadio;
