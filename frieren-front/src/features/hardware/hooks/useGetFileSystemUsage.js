/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { HARDWARE_GET_FILE_SYSTEM_USAGE } from '@src/features/hardware/helpers/queryKeys.js';

/**
 * Retrieves the file system usage by making an authenticated query to the server.
 *
 * @return {Object} The result of the query.
 */
const useGetFileSystemUsage = () => (
    useAuthenticatedQuery({
        queryKey: [HARDWARE_GET_FILE_SYSTEM_USAGE],
        queryFn: () => fetchPost({
            module: 'hardware',
            action: 'getFileSystemUsage',
        })
    })
);

export default useGetFileSystemUsage;
