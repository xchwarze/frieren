/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtom, useSetAtom } from 'jotai';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_REMOVE_STATUS } from '@src/features/packages/helpers/queryKeys.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';
import removingPackageAtom from '@src/features/packages/atoms/removingPackageAtom.js';
import useBackgroundTask from '@src/features/packages/hooks/useBackgroundTask.js';

/**
 * Manages removing a package via trigger + poll pattern.
 *
 * @return {Object} { remove, isPolling, isPending }
 */
const useRemovePackage = () => {
    const [removingName, setRemovingName] = useAtom(removingPackageAtom);
    const setReloadPackages = useSetAtom(reloadPackagesAtom);

    const taskStatus = useBackgroundTask({
        queryKey: PACKAGES_GET_REMOVE_STATUS,
        action: 'getRemoveStatus',
        onCompleted: () => {
            toast.success(`Package ${removingName} successfully removed`);
            setRemovingName('');
            setReloadPackages((c) => c + 1);
        },
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: ({ packageName }) => fetchPost({
            module: 'packages',
            action: 'removePackage',
            packageName,
        }),
        onSuccess: ({ success }, { packageName }) => {
            if (success) {
                setRemovingName(packageName);
                taskStatus.start();
            }
        },
    });

    return {
        remove: mutation.mutate,
        isPolling: taskStatus.isRunning,
        isPending: mutation.isPending,
    };
};

export default useRemovePackage;
