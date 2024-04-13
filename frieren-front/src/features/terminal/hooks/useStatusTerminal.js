/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { TERMINAL_GET_STATUS } from '@src/features/terminal/helpers/queryKeys.js';

/**
 * Returns a query hook that fetches the status of a terminal.
 *
 * @return {Object} The query hook object.
 */
const useStatusTerminal = () => (
    useAuthenticatedQuery({
        queryKey: [TERMINAL_GET_STATUS],
        queryFn: () => fetchPost({
            module: 'terminal',
            action: 'getStatus',
        })
    })
);

export default useStatusTerminal;
