/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { fetchPost } from '@src/services/fetchService.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';

/**
 * Sends a shutdown command to the hardware.
 *
 * @return {Object} The mutation object for hardware shutdown.
 */
const useShutDownMutation = () => (
    useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'header',
            action: 'shutDownHardware',
        }),
    })
);

export default useShutDownMutation;
