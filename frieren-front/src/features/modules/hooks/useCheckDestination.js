/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtomValue } from 'jotai';

import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_CHECK_DESTINATION } from '@src/features/modules/helpers/queryKeys.js';
import { installModuleAtom } from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';

/**
 * Function to utilize a mutation hook to check a destination using the atom provided module name and size.
 *
 * @return {Function} The mutation hook.
 */
const useCheckDestination = () => {
    const { name: moduleName, size: moduleSize } = useAtomValue(installModuleAtom);

    return useAuthenticatedQuery({
        queryKey: [MODULES_CHECK_DESTINATION, moduleName, moduleSize],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'checkDestination',
            moduleName,
            moduleSize,
        }),
        enabled: false,
        staleTime: 0,
    });
};

export default useCheckDestination;
