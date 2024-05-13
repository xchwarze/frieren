/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { dependencyInstallStatusAtom } from '@src/atoms/dependencyInstallStatusAtom.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_DEPENDENCY_INSTALLATION_STATUS } from '@src/helpers/queryKeys.js';

const useGetDependencyInstallationStatus = ({ module, dependenciesQueryKey }) => {
    const [{ isRunning}, setDependencyInstallStatus] = useAtom(dependencyInstallStatusAtom);
    const queryClient = useQueryClient();

    const query = useAuthenticatedQuery({
        queryKey: [MODULES_DEPENDENCY_INSTALLATION_STATUS, module],
        queryFn: () => fetchPost({
            action: 'getDependencyInstallationStatus',
            module,
        }),
        enabled: isRunning,
        staleTime: 0,
        refetchInterval: 5000,
    });

    useEffect(() => {
        if (query.isSuccess && query.data.isRunning === false) {
            // kill polling process
            setDependencyInstallStatus(query.data);

            // ui updates
            if (query.data.hasDependencies) {
                toast.success('The dependencies were successfully installed');
                queryClient.invalidateQueries({
                    queryKey: [dependenciesQueryKey],
                });
            }
        }
    }, [query.data, query.isSuccess, query.dataUpdatedAt, dependenciesQueryKey, setDependencyInstallStatus, queryClient]);

    return query
};

export default useGetDependencyInstallationStatus;
