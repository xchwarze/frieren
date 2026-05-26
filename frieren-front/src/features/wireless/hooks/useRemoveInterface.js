/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a mutation hook to remove a wireless interface by UCI section.
 *
 * @return {Object} The mutation object.
 */
const useRemoveInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ section }) => fetchPost({
            module: 'wireless',
            action: 'removeInterface',
            section,
        }),
        onSuccess: async () => {
            toast.success('Interface removed');
            await sleep(1500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW],
            });
        },
        onError: () => {
            toast.error('Failed to remove interface');
        },
    });
};

export default useRemoveInterface;
