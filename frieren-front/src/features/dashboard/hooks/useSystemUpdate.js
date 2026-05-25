/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { DASHBOARD_GET_UPDATE_STATUS } from '@src/features/dashboard/helpers/queryKeys.js';

/**
 * Manages the system update lifecycle: trigger, poll, notify.
 *
 * @return {Object} { startUpdate, isUpdating, isPending }
 */
const useSystemUpdate = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const toastShownRef = useRef(false);

    const statusQuery = useAuthenticatedQuery({
        queryKey: [DASHBOARD_GET_UPDATE_STATUS],
        queryFn: () => fetchPost({ module: 'dashboard', action: 'getSystemUpdateStatus' }),
        enabled: isUpdating,
        staleTime: 0,
        refetchInterval: 3000,
    });

    useEffect(() => {
        if (!isUpdating || !statusQuery.isSuccess || statusQuery.isFetching) {
            return;
        }

        if (statusQuery.data?.completed && !toastShownRef.current) {
            toastShownRef.current = true;
            setIsUpdating(false);
            toast.success('Update installed. Device is rebooting...');
        }
    }, [isUpdating, statusQuery.data, statusQuery.isSuccess, statusQuery.isFetching]);

    const mutation = useAuthenticatedMutation({
        mutationFn: ({ updateUrl }) => fetchPost({
            module: 'dashboard',
            action: 'startSystemUpdate',
            updateUrl,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                toastShownRef.current = false;
                setIsUpdating(true);
                toast.info('Downloading and installing update...');
            }
        },
    });

    const startUpdate = useCallback(({ updateUrl }) => {
        mutation.mutate({ updateUrl });
    }, [mutation]);

    return {
        startUpdate,
        isUpdating,
        isPending: mutation.isPending,
    };
};

export default useSystemUpdate;
