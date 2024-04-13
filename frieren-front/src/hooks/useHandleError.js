/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';

import authAtom from '@src/atoms/authAtom.js';

/**
 * Handles errors by setting authentication logic.
 *
 * @returns {Function} An error handling function that returns no value.
 */
const useHandleError = () => {
    const setAuth = useSetAtom(authAtom);
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    return (error) => {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('Not Authenticated')) {
            setAuth(false);
            setLocation('/');
            queryClient.clear();

            if (!window.authErrorToastShown) {
                toast.error('The session is no longer valid');
                window.authErrorToastShown = true;
                setTimeout(() => window.authErrorToastShown = false, 2000);
            }
        } else {
            toast.error(errorMessage);
        }
    };
};

export default useHandleError;
