/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useRef } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';

import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_INSTALLED } from '@src/features/packages/helpers/queryKeys.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import reloadPackagesAtom from '@src/features/packages/atoms/reloadPackagesAtom.js';

/**
 * Fetches installed packages in a single request.
 *
 * @return {Object} { load, isPolling, isLoaded, isPending }
 */
const useInstalledPackages = () => {
    const setInstalledPackages = useSetAtom(installedPackagesAtom);

    const query = useAuthenticatedQuery({
        queryKey: [PACKAGES_GET_INSTALLED],
        queryFn: () => fetchPost({
            module: 'packages',
            action: 'getInstalledPackages',
        }),
    });

    useEffect(() => {
        if (query.isSuccess) {
            setInstalledPackages(query.data?.packages || []);
        }
    }, [query.data, query.isSuccess, setInstalledPackages]);

    const reloadSignal = useAtomValue(reloadPackagesAtom);
    const prevReloadRef = useRef(reloadSignal);
    useEffect(() => {
        if (reloadSignal !== prevReloadRef.current) {
            prevReloadRef.current = reloadSignal;
            query.refetch();
        }
    }, [reloadSignal, query.refetch]);

    return {
        load: query.refetch,
        isPolling: query.isFetching,
        isLoaded: query.isSuccess,
        isPending: query.isPending,
    };
};

export default useInstalledPackages;
