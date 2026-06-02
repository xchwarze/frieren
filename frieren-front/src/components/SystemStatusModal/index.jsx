/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import PropTypes from 'prop-types';

import authAtom from '@src/atoms/authAtom.js';
import Icon from '@src/components/Icon';
import Loading from '@src/components/Loading';
import { fetchPost } from '@src/services/fetchService.js';

const REBOOT_POLL_INTERVAL = 20000;
const SHUTDOWN_DISCONNECT_DELAY = 30000;

/**
 * Checks whether a fetch error indicates the device is unreachable (network failure or timeout).
 *
 * @param {Error} error - The error thrown by fetchPost.
 * @return {boolean} True if the device could not be reached at all.
 */
const isDeviceUnreachable = (error) =>
    error instanceof TypeError || error.message === 'Request timed out';

/**
 * Modal that displays device status during restart or shutdown operations.
 * On restart: polls the server every 20 seconds and redirects to login when the device responds.
 * On shutdown: shows a progress message, then a disconnect prompt after 30 seconds.
 *
 * @param {string|null} action - Current action: 'restart', 'shutdown', or null.
 * @returns {ReactElement|null} The status modal or null when no action is active.
 */
const SystemStatusModal = ({ action }) => {
    const setAuth = useSetAtom(authAtom);
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [canDisconnect, setCanDisconnect] = useState(false);

    const redirectToLogin = useCallback(() => {
        setAuth(false);
        setLocation('/');
        queryClient.clear();
    }, [setAuth, setLocation, queryClient]);

    useEffect(() => {
        if (action !== 'restart') return;

        let timeoutId;
        let cancelled = false;

        const poll = async () => {
            try {
                await fetchPost({ module: 'header', action: 'serverPing' });
                if (!cancelled) redirectToLogin();
            } catch (error) {
                if (!cancelled && !isDeviceUnreachable(error)) {
                    redirectToLogin();
                    return;
                }
            }

            if (!cancelled) {
                timeoutId = setTimeout(poll, REBOOT_POLL_INTERVAL);
            }
        };

        timeoutId = setTimeout(poll, REBOOT_POLL_INTERVAL);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [action, redirectToLogin]);

    useEffect(() => {
        if (action !== 'shutdown') return;

        const timeoutId = setTimeout(() => {
            setCanDisconnect(true);
        }, SHUTDOWN_DISCONNECT_DELAY);

        return () => clearTimeout(timeoutId);
    }, [action]);

    if (!action) {
        return null;
    }

    if (action === 'restart') {
        return (
            <Modal show backdrop={'static'} keyboard={false} centered>
                <Modal.Body className={'text-center py-5'}>
                    <Loading size={96} className={'mb-3'} />
                    <h5>Restarting device...</h5>
                    <p className={'text-muted mb-0'}>Checking connectivity every 20 seconds</p>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show backdrop={'static'} keyboard={false} centered>
            <Modal.Body className={'text-center py-5'}>
                {canDisconnect ? (
                    <>
                        <div className={'mb-3'}>
                            <Icon name={'check-circle'} style={{ fontSize: '2.5rem' }} />
                        </div>
                        <h5>You can now disconnect the device</h5>
                    </>
                ) : (
                    <>
                        <Loading size={96} className={'mb-3'} />
                        <h5>Shutting down device...</h5>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

SystemStatusModal.propTypes = {
    action: PropTypes.oneOf(['restart', 'shutdown']),
};

export default SystemStatusModal;
