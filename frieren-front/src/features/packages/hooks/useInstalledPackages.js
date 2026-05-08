/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useSetAtom } from 'jotai';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_INSTALLED_STATUS } from '@src/features/packages/helpers/queryKeys.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import useBackgroundTask from '@src/features/packages/hooks/useBackgroundTask.js';

/**
 * Manages loading installed packages via trigger + poll pattern.
 *
 * @return {Object} { load, isPolling, isLoaded, isPending }
 */
const useInstalledPackages = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const setInstalledPackages = useSetAtom(installedPackagesAtom);

    const taskStatus = useBackgroundTask({
        queryKey: PACKAGES_GET_INSTALLED_STATUS,
        action: 'getInstalledPackagesStatus',
        gcTime: 30 * 60 * 1000,
        onCompleted: (data) => {
            setInstalledPackages(data.packages || []);
            setIsLoaded(true);
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'packages',
            action: 'getInstalledPackages',
        }),
        onSuccess: ({ success }) => {
            if (success) {
                setIsLoaded(false);
                taskStatus.start();
            }
        },
    });

    return {
        load: mutation.mutate,
        isPolling: taskStatus.isRunning,
        isLoaded,
        isPending: mutation.isPending,
    };
};

export default useInstalledPackages;
