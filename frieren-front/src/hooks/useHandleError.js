/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';

import authAtom from '@src/atoms/authAtom.js';

// Backend messages that mean the session can no longer make authenticated calls.
// 'Invalid CSRF token' is included so a desynced XSRF cookie (cleared, stripped,
// or expired while the session lingers) bounces the user to re-login instead of
// stranding them on an erroring view — the login response re-mints the cookie.
const SESSION_RECOVERABLE_MESSAGES = ['Not Authenticated', 'Invalid CSRF token'];
const SESSION_INVALID_MESSAGE = 'The session is no longer valid';
const TOAST_DEDUPE_WINDOW_MS = 2000;

// Module-scoped dedupe state (one Map per loaded bundle, shared across all hook
// instances). Collapses bursts of identical toasts — e.g. concurrent 401s from
// parallel React Query calls — without leaking a flag onto window or stacking timeouts.
const toastDedupeTimeouts = new Map();

/**
 * Shows a toast at most once per dedupe key within TOAST_DEDUPE_WINDOW_MS.
 * Distinct keys stay independent, so different errors remain visible.
 *
 * @param {String} dedupeKey - Identity used to collapse repeated toasts.
 * @return {void}
 */
const showDedupedErrorToast = (dedupeKey) => {
    if (toastDedupeTimeouts.has(dedupeKey)) {
        return;
    }

    toast.error(dedupeKey);
    const timeoutId = setTimeout(() => toastDedupeTimeouts.delete(dedupeKey), TOAST_DEDUPE_WINDOW_MS);
    toastDedupeTimeouts.set(dedupeKey, timeoutId);
};

/**
 * Handles errors by setting authentication logic.
 *
 * @return {Function} An error handling function that returns no value.
 */
const useHandleError = () => {
    const setAuth = useSetAtom(authAtom);
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    return (error, { showGenericToast = true } = {}) => {
        const errorMessage = error instanceof Error ? error.message : '';
        const isSessionRecoverable = SESSION_RECOVERABLE_MESSAGES.some(
            (message) => errorMessage.includes(message)
        );

        if (isSessionRecoverable) {
            setAuth(false);
            setLocation('/');
            queryClient.clear();

            showDedupedErrorToast(SESSION_INVALID_MESSAGE);
        } else if (showGenericToast && errorMessage) {
            showDedupedErrorToast(errorMessage);
        }
    };
};

export default useHandleError;
