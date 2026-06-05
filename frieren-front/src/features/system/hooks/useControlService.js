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
 * Returns a mutation hook to start/stop/restart an init.d service.
 *
 * @return {Object} The mutation object.
 */
const useControlService = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ name, command }) => fetchPost({
            module: 'system',
            action: 'controlService',
            name,
            command,
        }),
        onSuccess: (data, { name, command }) => {
            toast.success(`${name} ${command}ed`);
            queryClient.invalidateQueries({ queryKey: [SYSTEM_GET_SERVICES] });
        },
        onError: () => {
            toast.error('Failed to control service');
        },
    });
};

export default useControlService;
