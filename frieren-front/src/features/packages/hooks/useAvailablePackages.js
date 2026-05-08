/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useAtom } from 'jotai';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_AVAILABLE_STATUS } from '@src/features/packages/helpers/queryKeys.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';
import useBackgroundTask from '@src/features/packages/hooks/useBackgroundTask.js';

/**
 * Manages loading available packages via trigger + poll pattern.
 *
 * @return {Object} { load, isPolling, isLoaded, isPending }
 */
const useAvailablePackages = () => {
    const [availablePackages, setAvailablePackages] = useAtom(availablePackagesAtom);
    const [isLoaded, setIsLoaded] = useState(() => availablePackages.length > 0);

    const taskStatus = useBackgroundTask({
        queryKey: PACKAGES_GET_AVAILABLE_STATUS,
        action: 'getAvailablePackagesStatus',
        gcTime: 30 * 60 * 1000,
        onCompleted: (data) => {
            setAvailablePackages(data.packages || []);
            setIsLoaded(true);
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'packages',
            action: 'getAvailablePackages',
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

export default useAvailablePackages;
