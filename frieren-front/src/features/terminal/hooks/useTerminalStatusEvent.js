/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { TERMINAL_STATUS_EVENT } from '@frieren/terminal-core';

import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js'

/**
 * Bridges FrierenTerminal (framework-agnostic) with React state via CustomEvent.
 * FrierenTerminal dispatches TERMINAL_STATUS_EVENT events on window with connection status changes,
 * and this hook forwards them into socketStatusAtom so React components can react to them.
 *
 * @return {void}
 */
const useTerminalStatusEvent = () => {
    const setSocketStatus = useSetAtom(socketStatusAtom);

    useEffect(() => {
        const handleEvent = (event) => {
            setSocketStatus(event.detail.status);
        };

        window.addEventListener(TERMINAL_STATUS_EVENT, handleEvent);

        return () => {
            window.removeEventListener(TERMINAL_STATUS_EVENT, handleEvent);
        };
    }, [setSocketStatus]);
};

export default useTerminalStatusEvent;
