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
 * Returns a mutation hook for updating the user's password.
 *
 * @return {Function} The mutation hook.
 */
const useUpdateUserPassword = () => (
    useAuthenticatedMutation({
        mutationFn: ({ currentPassword, newPassword }) => fetchPost({
            module: 'settings',
            action: 'setUserPassword',
            currentPassword,
            newPassword,
        }),
        onSuccess: () => {
            toast.success('Password updated');
        },
        onError: () => {
            toast.error('Failed to update password');
        },
    })
);

export default useUpdateUserPassword;
