/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';
import { DASHBOARD_GET_UPDATE_STATUS } from '@src/features/dashboard/helpers/queryKeys.js';

/**
 * Manages the system update lifecycle: trigger, poll, notify.
 *
 * @return {Object} { startUpdate, isUpdating, isPending }
 */
const useSystemUpdate = () => {
    const taskStatus = useBackgroundTask({
        queryKey: DASHBOARD_GET_UPDATE_STATUS,
        module: 'dashboard',
        action: 'getSystemUpdateStatus',
        onCompleted: () => {
            toast.success('Update installed. Device is rebooting...');
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: ({ updateUrl }) => fetchPost({
            module: 'dashboard',
            action: 'startSystemUpdate',
            updateUrl,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                taskStatus.start();
                toast.info('Downloading and installing update...');
            }
        },
    });

    return {
        startUpdate: mutation.mutate,
        isUpdating: taskStatus.isRunning,
        isPending: mutation.isPending,
    };
};

export default useSystemUpdate;
