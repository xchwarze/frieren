/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_INSTALL_STATUS } from '@src/features/packages/helpers/queryKeys.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';
import useBackgroundTask from '@src/features/packages/hooks/useBackgroundTask.js';

/**
 * Manages installing a package via trigger + poll pattern.
 *
 * @return {Object} { install, isPolling, isPending, installingName }
 */
const useInstallPackage = () => {
    const [installingName, setInstallingName] = useState('');
    const setReloadPackages = useSetAtom(reloadPackagesAtom);

    const taskStatus = useBackgroundTask({
        queryKey: PACKAGES_GET_INSTALL_STATUS,
        action: 'getInstallStatus',
        onCompleted: () => {
            toast.success(`Package ${installingName} successfully installed`);
            setInstallingName('');
            setReloadPackages((c) => c + 1);
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: ({ packageName }) => fetchPost({
            module: 'packages',
            action: 'installPackage',
            packageName,
        }),
        onSuccess: ({ success }, { packageName }) => {
            if (success) {
                setInstallingName(packageName);
                taskStatus.start();
            }
        },
    });

    return {
        install: mutation.mutate,
        isPolling: taskStatus.isRunning,
        isPending: mutation.isPending,
        installingName,
    };
};

export default useInstallPackage;
