/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useRef } from 'react';
import { FrierenTerminal } from '@frieren/terminal-core';
import '@frieren/terminal-core/index.css';

const WS_PORT = 1477;

const buildWsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:${WS_PORT}/ws`;
};

/**
 * Hook that creates and manages a FrierenTerminal instance attached to a container element.
 * Handles terminal lifecycle (open, connect, dispose) and auto-fits on container resize.
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef - Reference to the container element.
 * @return {React.RefObject<FrierenTerminal>} Reference to the terminal instance.
 */
const useTerminal = (containerRef) => {
    const terminalRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const term = new FrierenTerminal({
            wsUrl: buildWsUrl(),
        });

        term.open(container);
        term.connect();
        terminalRef.current = term;

        let rafId = null;
        const resizeObserver = new ResizeObserver(() => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => term.fit());
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            term.dispose();
            terminalRef.current = null;
        };
    }, [containerRef]);

    return terminalRef;
};

export default useTerminal;
