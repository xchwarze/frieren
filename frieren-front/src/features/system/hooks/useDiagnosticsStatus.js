/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_DIAGNOSTICS_STATUS } from '@src/features/system/helpers/queryKeys.js';

/**
 * Retrieves the diagnostics status
 *
 * @return {Object} The result of the query.
 */
const useDiagnosticsStatus = () => (
    useAuthenticatedQuery({
        queryKey: [SYSTEM_GET_DIAGNOSTICS_STATUS],
        queryFn: () => fetchPost({
            module: 'system',
            action: 'getDiagnosticsStatus',
        })
    })
);

export default useDiagnosticsStatus;
