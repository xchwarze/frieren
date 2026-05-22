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
 * Hook that listens for the 'ws-terminal' event on the iframe's contentWindow and updates the socketStatusAtom with the received status.
 *
 * @param {React.RefObject<HTMLIFrameElement>} iframeRef - Reference to the iframe element.
 * @param {String} terminalStatus - Current terminal status.
 * @return {void} This hook does not return anything.
 */
const useTerminalStatusEvent = (iframeRef, terminalStatus) => {
    const setSocketStatus = useSetAtom(socketStatusAtom);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }

        const handleEvent = (event) => {
            setSocketStatus(event.detail.status);
        };

        const attachListener = () => {
            if (iframe.contentWindow && 'addEventListener' in iframe.contentWindow) {
                iframe.contentWindow.addEventListener('ws-terminal', handleEvent);
            }
        };

        attachListener();
        iframe.addEventListener('load', attachListener);

        return () => {
            iframe.removeEventListener('load', attachListener);
            if (iframe.contentWindow) {
                iframe.contentWindow.removeEventListener('ws-terminal', handleEvent);
            }
        };
    }, [iframeRef, terminalStatus, setSocketStatus]);
};

export default useTerminalStatusEvent;
