/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

const usePinModule = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ moduleName, status }) => fetchPost({
            module: 'modules',
            action: 'pinModule',
            moduleName,
            status,
        }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [MODULES_GET_MODULE_LIST]
            });
            queryClient.invalidateQueries({
                queryKey: [MODULES_GET_INSTALLED_MODULES]
            });

            if (variables.status === 'unpin') {
                toast.success(`The ${variables.moduleTitle} module was removed from the sidebar`);
            } else {
                toast.success(`The ${variables.moduleTitle} module was added to the sidebar`);
            }
        },
    });
}

export default usePinModule;
