/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';
import useGetInterfaceStatus from '@src/features/wireless/hooks/useGetInterfaceStatus.js';

const CONNECTION_TIMEOUT = 15000;

const SUCCESS_MESSAGES = {
    sta: 'Station connected successfully',
    ap: 'Access point started successfully',
    monitor: 'Monitor interface started successfully',
};

const FAILURE_MESSAGES = {
    sta: 'Connection failed. Check the password and try again.',
    ap: 'Access point failed to start.',
    monitor: 'Monitor interface failed to start.',
};

const RADIO_DISABLED_MESSAGE = "Interface saved. Its radio is disabled — enable it in Radio Configuration to bring it up.";

/**
 * Renderless component that polls interface status after a config change
 * and shows a toast notification with the result.
 *
 * @param {string} section - UCI section name of the interface.
 * @param {boolean} [radioDisabled] - The interface's radio is disabled, so it can never
 *   come up. Skips polling and the misleading "failed to start" timeout message in favor
 *   of an accurate one.
 * @param {Function} onDone - Called when the check finishes (success, timeout, or skipped).
 * @return {null}
 */
const InterfaceStatusNotifier = ({ section, radioDisabled, onDone }) => {
    const queryClient = useQueryClient();
    const { data } = useGetInterfaceStatus(section, { enabled: !radioDisabled });
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (radioDisabled) {
            return;
        }

        const timer = setTimeout(() => setTimedOut(true), CONNECTION_TIMEOUT);
        return () => clearTimeout(timer);
    }, [radioDisabled]);

    useEffect(() => {
        if (radioDisabled) {
            toast.info(RADIO_DISABLED_MESSAGE);
            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
            onDone();
            return;
        }

        const state = data?.state;
        const mode = data?.mode || 'ap';
        const isSuccess = state === 'COMPLETED' || state === 'UP';

        if (isSuccess || timedOut) {
            if (isSuccess) {
                const message = SUCCESS_MESSAGES[mode] || SUCCESS_MESSAGES.ap;
                toast.success(mode === 'sta' && data?.ip
                    ? <>{message}<br />IP: {data.ip}</>
                    : message
                );
            } else {
                toast.error(FAILURE_MESSAGES[mode] || FAILURE_MESSAGES.ap);
            }

            queryClient.invalidateQueries({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
            onDone();
        }
    }, [data, timedOut, onDone, radioDisabled]);

    return null;
};

InterfaceStatusNotifier.propTypes = {
    section: PropTypes.string.isRequired,
    radioDisabled: PropTypes.bool,
    onDone: PropTypes.func.isRequired,
};

export default InterfaceStatusNotifier;
