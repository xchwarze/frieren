/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { DASHBOARD_GET_NEWS } from '@src/features/dashboard/helpers/queryKeys.js';

/**
 * Returns a query hook that fetches news from the remote server.
 *
 * @param {Object} options - Optional configuration options for the query hook.
 * @return {Object} The result of the query.
 */
const useNews = (options = {}) => (
    useAuthenticatedQuery({
        queryKey: [DASHBOARD_GET_NEWS],
        queryFn: () => fetchPost({
            module: 'dashboard',
            action: 'getNews',
        }),
        ...options,
    })
);

export default useNews;
