/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
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
        const handleEvent = (event) => {
            setSocketStatus(event.detail.status);
        };

        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow && 'addEventListener' in iframe.contentWindow) {
            iframe.contentWindow.addEventListener('ws-terminal', handleEvent);
        }

        return () => {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.removeEventListener('ws-terminal', handleEvent);
            }
        };
    }, [iframeRef, terminalStatus, setSocketStatus]);
};

export default useTerminalStatusEvent;
