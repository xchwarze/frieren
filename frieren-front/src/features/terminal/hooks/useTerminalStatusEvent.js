/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js'

/**
 * Hook that listens for 'ws-terminal' events dispatched by FrierenTerminal and updates the socketStatusAtom.
 *
 * @return {void}
 */
const useTerminalStatusEvent = () => {
    const setSocketStatus = useSetAtom(socketStatusAtom);

    useEffect(() => {
        const handleEvent = (event) => {
            setSocketStatus(event.detail.status);
        };

        window.addEventListener('ws-terminal', handleEvent);

        return () => {
            window.removeEventListener('ws-terminal', handleEvent);
        };
    }, [setSocketStatus]);
};

export default useTerminalStatusEvent;
