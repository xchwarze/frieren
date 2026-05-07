/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Custom hook to trigger a background package install.
 *
 * @return {Object} The mutation object with mutate function and status.
 */
const useInstallPackage = () => (
    useAuthenticatedMutation({
        mutationFn: ({ packageName }) => fetchPost({
            module: 'packages',
            action: 'installPackage',
            packageName: packageName,
        }),
    })
);

export default useInstallPackage;
