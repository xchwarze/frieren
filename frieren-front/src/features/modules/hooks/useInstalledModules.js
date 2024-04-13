/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

/**
 * A custom hook to fetch the installed modules.
 *
 * @return {Object} The result of the query.
 */
const useInstalledModules = () => (
    useAuthenticatedQuery({
        queryKey: [MODULES_GET_INSTALLED_MODULES],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'getInstalledModules',
        })
    })
);

export default useInstalledModules;
