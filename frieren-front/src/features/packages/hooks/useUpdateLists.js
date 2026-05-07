/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_INSTALLED, PACKAGES_GET_AVAILABLE } from '@src/features/packages/helpers/queryKeys.js';

/**
 * Custom hook to update opkg package lists.
 *
 * @return {Function} The mutation function to update lists.
 */
const useUpdateLists = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'packages',
            action: 'updateLists',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [PACKAGES_GET_INSTALLED]
            });
            queryClient.invalidateQueries({
                queryKey: [PACKAGES_GET_AVAILABLE]
            });
        },
    });
};

export default useUpdateLists;
