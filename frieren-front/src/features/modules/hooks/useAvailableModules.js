/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_AVAILABLE_MODULES } from '@src/features/modules/helpers/queryKeys.js';

/**
 * Returns a query hook that fetches available modules from the server.
 *
 * @param {Object} options - Optional configuration options for the query hook.
 * @return {Object} The result of the query.
 */
const useAvailableModules = (options = {}) => (
    useAuthenticatedQuery({
        queryKey: [MODULES_GET_AVAILABLE_MODULES],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'getAvailableModules',
        }),
        ...options,
    })
);

export default useAvailableModules;
