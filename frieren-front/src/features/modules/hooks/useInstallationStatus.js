/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';

import useInterval from '@src/hooks/useInterval';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Generates a function comment for the given function body in a markdown code block with the correct language syntax.
 *
 * @param {String} moduleName - The name of the module.
 * @param {Boolean} isActive - Indicates whether the module is active.
 * @return {Boolean} Returns a boolean indicating if the installation is complete.
 */
const useInstallationStatus = ({ moduleName, isActive }) => {
    const [installationComplete, setInstallationComplete] = useState(false);
    const callback = async () => {
        if (!installationComplete) {
            const response = await fetchPost({
                module: 'modules',
                action: 'installStatus',
                moduleName,
            });
            if (response.success) {
                setInstallationComplete(true);
            }
        }
    }
    useInterval(callback,  isActive && !installationComplete ? 1000 : null);

    return installationComplete;
};

export default useInstallationStatus;
