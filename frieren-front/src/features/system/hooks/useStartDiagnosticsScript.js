/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_DIAGNOSTICS_STATUS } from '@src/features/system/helpers/queryKeys.js';

/**
 * Initializes the diagnostic script on the server and polls for completion.
 *
 * @return {Object} { mutate, isPending, isPolling }
 */
const useStartDiagnosticsScript = () => {
    const taskStatus = useBackgroundTask({
        queryKey: SYSTEM_GET_DIAGNOSTICS_STATUS,
        module: 'system',
        action: 'getDiagnosticsStatus',
    });

    const mutation = useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'system',
            action: 'startDiagnosticsScript',
        }),
        onSuccess: () => {
            taskStatus.start();
        },
    });

    return {
        mutate: mutation.mutate,
        isPending: mutation.isPending,
        isPolling: taskStatus.isRunning,
    };
};

export default useStartDiagnosticsScript;
