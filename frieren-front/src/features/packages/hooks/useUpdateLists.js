/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_UPDATE_STATUS } from '@src/features/packages/helpers/queryKeys.js';
import useBackgroundTask from '@src/features/packages/hooks/useBackgroundTask.js';

/**
 * Manages updating package lists via trigger + poll pattern.
 *
 * @param {Object} [options]
 * @param {Function} [options.onCompleted] - Called when update finishes.
 * @return {Object} { update, isPolling, isPending }
 */
const useUpdateLists = ({ onCompleted } = {}) => {
    const taskStatus = useBackgroundTask({
        queryKey: PACKAGES_GET_UPDATE_STATUS,
        action: 'getUpdateStatus',
        onCompleted,
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'packages',
            action: 'updateLists',
        }),
        onSuccess: ({ success }) => {
            if (success) {
                taskStatus.start();
            }
        },
    });

    return {
        update: mutation.mutate,
        isPolling: taskStatus.isRunning,
        isPending: mutation.isPending,
    };
};

export default useUpdateLists;
