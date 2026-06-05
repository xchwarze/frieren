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
import { SYSTEM_GET_SERVICES } from '@src/features/system/helpers/queryKeys.js';

/**
 * Returns a mutation hook to enable/disable an init.d service on boot.
 *
 * @return {Object} The mutation object.
 */
const useToggleEnabled = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name, enabled }) => fetchPost({
            module: 'system',
            action: 'toggleEnabled',
            name,
            enabled,
        }),
        onSuccess: (data, { name, enabled }) => {
            toast.success(`${name} ${enabled ? 'enabled' : 'disabled'} on boot`);
            queryClient.invalidateQueries({ queryKey: [SYSTEM_GET_SERVICES] });
        },
        onError: () => {
            toast.error('Failed to change boot state');
        },
    });
};

export default useToggleEnabled;
