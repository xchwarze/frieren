/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Triggers a system update (download + install + reboot). The "updating" wait —
 * loading window, reboot detection and redirect — is handled by SystemStatusModal
 * (action='update'), mirroring the restart flow.
 *
 * @return {Object} The mutation object.
 */
const useSystemUpdate = () => (
    useAuthenticatedMutation({
        mutationFn: ({ updateUrl }) => fetchPost({
            module: 'dashboard',
            action: 'startSystemUpdate',
            updateUrl,
        }),
    })
);

export default useSystemUpdate;
