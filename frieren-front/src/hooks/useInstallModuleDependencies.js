/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useSetAtom } from 'jotai';

import { sleep } from '@src/helpers/actionsHelper.js';
import { setIsRunningAtom } from '@src/atoms/dependencyInstallStatusAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useGetDependencyInstallationStatus from '@src/hooks/useGetDependencyInstallationStatus.js';
import { fetchPost } from '@src/services/fetchService.js';

const useInstallModuleDependencies = ({ module, dependenciesQueryKey }) => {
    const setIsRunning = useSetAtom(setIsRunningAtom);
    useGetDependencyInstallationStatus({
        dependenciesQueryKey,
        module
    });

    return useAuthenticatedMutation({
        mutationFn: ({ destination }) => fetchPost({
            action: 'installModuleDependencies',
            module,
            destination,
        }),
        onSuccess: async () => {
            await sleep(600);
            setIsRunning(true);
        },
    });
};

export default useInstallModuleDependencies;
