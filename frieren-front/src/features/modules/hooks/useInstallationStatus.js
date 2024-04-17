/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';

import { fetchPost } from '@src/services/fetchService.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_INSTALLATION_STATUS, MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';
import { installModuleAtom } from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';

/**
 * Generates a hook to track installation status.
 *
 * @return {Boolean} Returns true when download is complete.
 */
const useInstallationStatus = () => {
    const [isRunning, setIsRunning] = useState(false);
    const setInstallModule = useSetAtom(installModuleAtom);
    const queryClient = useQueryClient();

    const query = useAuthenticatedQuery({
        queryKey: [MODULES_INSTALLATION_STATUS],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'installStatus',
        }),
        enabled: isRunning,
        staleTime: 0,
        refetchInterval: 2500,
    });

    useEffect(() => {
        if (query.isSuccess) {
            // for enabling polling
            setIsRunning(query.data.success === false);

            // I use both of them to force the effect to always run...!
            if (query.isSuccess && query.isFetching === false) {
                queryClient.invalidateQueries({
                    queryKey: [MODULES_GET_MODULE_LIST],
                });
                queryClient.invalidateQueries({
                    queryKey: [MODULES_GET_INSTALLED_MODULES],
                });
                setInstallModule(false);
            }
        }
    }, [query.data, query.isSuccess, query.isFetching, queryClient, setInstallModule]);

    return query
};

export default useInstallationStatus;
