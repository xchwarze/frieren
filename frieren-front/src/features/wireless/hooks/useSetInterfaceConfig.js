/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import {
    WIRELESS_GET_WIRELESS_OVERVIEW,
    WIRELESS_GET_INTERFACE_CONFIG,
} from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a mutation hook to update the configuration of an existing wireless interface.
 *
 * @return {Object} The mutation object.
 */
const useSetInterfaceConfig = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ section, ssid, encryption, key, mode, network, hidden, disabled, isManagement, isRecon }) => fetchPost({
            module: 'wireless',
            action: 'setInterfaceConfig',
            section,
            ssid,
            encryption,
            key,
            mode,
            network,
            hidden,
            disabled,
            isManagement,
            isRecon,
        }),
        onSuccess: async (data, { section }) => {
            await sleep(1500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW],
            });
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_INTERFACE_CONFIG, section],
            });
        },
    });
};

export default useSetInterfaceConfig;
