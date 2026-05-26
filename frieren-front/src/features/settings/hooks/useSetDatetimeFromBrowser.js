/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

const getBrowserTimezoneOffset = () => {
    const now = new Date();
    const timezoneOffsetInMinutes = -now.getTimezoneOffset();
    const offsetHours = Math.round(timezoneOffsetInMinutes / 60);
    const sign = offsetHours >= 0 ? '+' : '-';

    return `GMT${sign}${Math.abs(offsetHours)}`;
};

const retrieveDatetime = () => ({
    datetime: Math.floor(Date.now() / 1000),
    timezone: getBrowserTimezoneOffset(),
});

/**
 * Generate a mutation to set datetime from browser using fetchPost.
 *
 * @return {Function} The mutation hook.
 */
const useSetDatetimeFromBrowser = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'settings',
            action: 'setDatetimeFromBrowser',
            ...retrieveDatetime(),
        }),
        onSuccess: () => {
            toast.success('Date and time synchronized');
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
        onError: () => {
            toast.error('Failed to synchronize date and time');
        },
    });
};

export default useSetDatetimeFromBrowser;
