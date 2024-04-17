/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useState } from 'react';

import { fetchPost } from '@src/services/fetchService.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { MODULES_DOWNLOAD_STATUS } from '@src/features/modules/helpers/queryKeys.js';
import useInstallModule from '@src/features/modules/hooks/useInstallModule.js';

/**
 * Generates a hook to track download status.
 *
 * @return {Boolean} Returns true when download is complete.
 */
const useDownloadStatus = () => {
    const [isRunning, setIsRunning] = useState(false);
    const { mutate: installModule } = useInstallModule();

    const query = useAuthenticatedQuery({
        queryKey: [MODULES_DOWNLOAD_STATUS],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'downloadStatus',
        }),
        enabled: isRunning,
        staleTime: 0,
        refetchInterval: 2500,
    });

    useEffect(() => {
        // I use both of them to force the effect to always run...!
        if (query.isSuccess && query.isFetching === false) {
            // for enabling polling
            setIsRunning(query.data.success === false);

            if (query.data.success) {
                installModule();
            }
        }
    }, [query.data, query.isSuccess, query.isFetching, installModule]);

    return query
};

export default useDownloadStatus;
