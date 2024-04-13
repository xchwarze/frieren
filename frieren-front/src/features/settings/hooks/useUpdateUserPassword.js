/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
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
        })
    })
);

export default useUpdateUserPassword;
