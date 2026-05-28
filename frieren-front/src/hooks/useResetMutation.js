/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { fetchPost } from '@src/services/fetchService.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';

/**
 * Sends a reboot command to the hardware.
 *
 * @return {Object} The mutation object for hardware reset.
 */
const useResetMutation = () => (
    useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'header',
            action: 'resetHardware',
        }),
    })
);

export default useResetMutation;
