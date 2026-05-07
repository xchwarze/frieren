/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Triggers the background fetch of installed packages.
 *
 * @return {Object} The mutation object.
 */
const useInstalledPackages = () => (
    useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'packages',
            action: 'getInstalledPackages',
        }),
    })
);

export default useInstalledPackages;
