/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import PropTypes from 'prop-types';
import { TerminalLiteViewer, TERMINAL_THEMES } from '@frieren/terminal-core';

// Shared read-only xterm log pane for any module/panel surface. Self-contained on
// purpose (no feature-path imports) so a module bundling it via @src/@common resolves
// cleanly. Reads the operator's terminal settings from the same localStorage key the
// panel terminal uses, so the scheme/font match without any extra wiring or API.
const terminalSettingsAtom = atomWithStorage('terminal-settings', {
    terminalTheme: 'default',
    fontSize: 13,
    cursorStyle: 'block',
    cursorBlink: false,
});

const resolveTheme = (name) => TERMINAL_THEMES[name] ?? TERMINAL_THEMES.default;

/**
 * Read-only xterm.js viewer for streamed/append tool output (e.g. a drained log of
 * hcxdumptool --rds). Pass new bytes via `chunk`; they are written (appended) so
 * cursor-control escapes process in order like a live terminal. `tick` should change
 * once per delivery (e.g. a poll timestamp); `clearSignal` toggling truthy→from-falsy
 * clears the viewer (e.g. a new run). Uses the operator's configured terminal theme +
 * font. The container is vertically resizable; xterm refits via a ResizeObserver.
 * xterm CSS must be loaded app-wide by the host panel.
 *
 * @return {ReactElement} The LogView component.
 */
const LogView = ({ chunk = '', tick = 0, clearSignal = false, height = 300, minHeight = 160 }) => {
    const { terminalTheme = 'default', fontSize = 13 } = useAtomValue(terminalSettingsAtom);
    const containerRef = useRef(null);
    const viewerRef = useRef(null);
    const prevClearRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return undefined;
        }

        const viewer = new TerminalLiteViewer({
            theme: resolveTheme(terminalTheme),
            termOptions: { fontSize },
        });
        viewer.open(container);
        viewerRef.current = viewer;

        const observer = new ResizeObserver(() => viewer.fit());
        observer.observe(container);

        return () => {
            observer.disconnect();
            viewer.dispose();
            container.innerHTML = '';
            viewerRef.current = null;
        };
        // Built once; theme changes apply via the effect below (font needs a remount).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        viewerRef.current?.setTheme(resolveTheme(terminalTheme));
    }, [terminalTheme]);

    // Clear on the rising edge of clearSignal (e.g. a new run starting).
    useEffect(() => {
        if (clearSignal && !prevClearRef.current) {
            viewerRef.current?.clear();
        }
        prevClearRef.current = clearSignal;
    }, [clearSignal]);

    // Append each delivery's new output (keyed on tick).
    useEffect(() => {
        if (chunk) {
            viewerRef.current?.write(chunk);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    return (
        <div
            ref={containerRef}
            className={'mb-3'}
            style={{ height: `${height}px`, minHeight: `${minHeight}px`, resize: 'vertical', overflow: 'hidden' }}
        />
    );
};

LogView.propTypes = {
    chunk: PropTypes.string,
    tick: PropTypes.number,
    clearSignal: PropTypes.bool,
    height: PropTypes.number,
    minHeight: PropTypes.number,
};

export default LogView;
