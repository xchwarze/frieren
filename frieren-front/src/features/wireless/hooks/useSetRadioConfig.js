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
import { WIRELESS_GET_WIRELESS_OVERVIEW, WIRELESS_GET_RADIO_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a mutation hook to update the configuration for a specific radio device.
 * Invalidates the overview and radio config caches on success.
 *
 * @return {Object} The mutation object.
 */
const useSetRadioConfig = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ radio, channel, txpower, htmode, country, disabled }) => fetchPost({
            module: 'wireless',
            action: 'setRadioConfig',
            radio,
            channel,
            txpower,
            htmode,
            country,
            disabled,
        }),
        onSuccess: async () => {
            await sleep(1500);
            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_RADIO_CONFIG] });
        },
    });
};

export default useSetRadioConfig;
