/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Returns a mutation hook to run a ping against a host.
 *
 * @return {Object} The mutation object.
 */
const useRunPing = () => useAuthenticatedMutation({
    mutationFn: ({ host }) => fetchPost({
        module: 'network',
        action: 'runPing',
        host,
    }),
    onError: () => {
        toast.error('Failed to run ping');
    },
});

export default useRunPing;
