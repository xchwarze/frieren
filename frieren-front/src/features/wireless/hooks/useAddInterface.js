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
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a mutation hook to add a new wireless interface to a radio.
 *
 * @return {Object} The mutation object.
 */
const useAddInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ radio, ssid, encryption, key, mode, network, hidden, disabled, isManagement, isRecon }) => fetchPost({
            module: 'wireless',
            action: 'addInterface',
            radio,
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
        onSuccess: async () => {
            await sleep(1500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW],
            });
        },
    });
};

export default useAddInterface;
