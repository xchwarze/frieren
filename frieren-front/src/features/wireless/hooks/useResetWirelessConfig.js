/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW, WIRELESS_GET_RAW_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Regenerates /etc/config/wireless from hardware defaults and reloads wifi.
 * Invalidates the overview and raw config caches on success.
 *
 * @return {Object} The mutation object.
 */
const useResetWirelessConfig = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'wireless',
            action: 'resetWirelessConfig',
        }),
        onSuccess: async () => {
            await sleep(1500);
            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_RAW_CONFIG] });
        },
    });
};

export default useResetWirelessConfig;
