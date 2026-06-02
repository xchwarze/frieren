/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_DEPENDENCY_INSTALLATION_STATUS } from '@src/helpers/queryKeys.js';

const useInstallModuleDependencies = ({ module, dependenciesQueryKey }) => {
    const [installFailed, setInstallFailed] = useState(false);
    const queryClient = useQueryClient();

    const taskStatus = useBackgroundTask({
        queryKey: MODULES_DEPENDENCY_INSTALLATION_STATUS,
        module,
        action: 'getDependencyInstallationStatus',
        onCompleted: (data) => {
            if (data.hasDependencies) {
                toast.success('The dependencies were successfully installed');
                queryClient.invalidateQueries({
                    queryKey: [dependenciesQueryKey],
                });
                setInstallFailed(false);
            } else {
                setInstallFailed(true);
            }
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: ({ destination }) => fetchPost({
            action: 'installModuleDependencies',
            module,
            destination,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                setInstallFailed(false);
                taskStatus.start();
            }
        },
    });

    return {
        install: mutation.mutate,
        isPolling: taskStatus.isRunning,
        isPending: mutation.isPending,
        output: taskStatus.data?.output ?? '',
        installFailed,
    };
};

export default useInstallModuleDependencies;
