/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { FrierenTerminal } from '@frieren/terminal-core';
import '@frieren/terminal-core/index.css';

import terminalSettingsAtom from '@src/features/terminal/atoms/terminalSettingsAtom.js';
import { TERMINAL_THEMES } from '@src/features/terminal/helpers/terminalThemes.js';

const WS_PORT = 1477;

const buildWsUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.hostname}:${WS_PORT}/ws`;
};

/**
 * Hook that creates and manages a FrierenTerminal instance attached to a container element.
 * Handles terminal lifecycle (open, connect, dispose) and auto-fits on container resize.
 *
 * Settings (theme, fontSize, cursorStyle, cursorBlink) are included as effect dependencies,
 * so any change fully destroys and recreates the terminal + websocket connection.
 * This avoids xterm addon lifecycle bugs that occur when mutating options on a live instance.
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef - Reference to the container element.
 * @return {React.RefObject<FrierenTerminal>} Reference to the terminal instance.
 */
const useTerminal = (containerRef) => {
    const terminalRef = useRef(null);
    const settings = useAtomValue(terminalSettingsAtom);
    const { terminalTheme, fontSize, cursorStyle, cursorBlink } = settings;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const theme = TERMINAL_THEMES[terminalTheme] ?? TERMINAL_THEMES.default;
        const term = new FrierenTerminal({
            wsUrl: buildWsUrl(),
            termOptions: { theme, fontSize, cursorStyle, cursorBlink },
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
            container.innerHTML = '';
            terminalRef.current = null;
        };
    // Settings deps trigger full terminal teardown + rebuild (see docblock above)
    }, [containerRef, terminalTheme, fontSize, cursorStyle, cursorBlink]);

    return terminalRef;
};

export default useTerminal;
