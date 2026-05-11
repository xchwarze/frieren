/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import usePollDiagnosticsStatus from '@src/features/hardware/hooks/usePollDiagnosticsStatus.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Initializes the diagnostic script on the server and starts polling logic.
 *
 * @return {Function} The mutation hook.
 */
const useStartDiagnosticsScript = () => {
    const { startPolling } = usePollDiagnosticsStatus();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'hardware',
            action: 'startDiagnosticsScript',
        }),
        onSuccess: () => {
            startPolling();
        },
    });
};

export default useStartDiagnosticsScript;
