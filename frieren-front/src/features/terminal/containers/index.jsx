/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMemo, useRef } from 'react';
import { Resizable } from 're-resizable';
import Collapse from 'react-bootstrap/Collapse';
import { useAtom, useAtomValue } from 'jotai';
import '@frieren/terminal-core/index.css';

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import terminalSettingsAtom from '@src/features/terminal/atoms/terminalSettingsAtom.js';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import panelHeightAtom from '@src/features/terminal/atoms/panelHeightAtom.js';
import { TERMINAL_THEMES } from '@src/features/terminal/helpers/terminalThemes.js';
import useTerminal from '@src/features/terminal/hooks/useTerminal.js';
import useTerminalStatusEvent from '@src/features/terminal/hooks/useTerminalStatusEvent.js';
import TerminalHeader from '@src/features/terminal/components/TerminalHeader';

/**
 * Inner terminal panel that mounts the xterm.js instance.
 * Separated from Terminal so useTerminal only runs when the container div is in the DOM.
 * This is required because xterm.js needs a mounted element to attach to during open().
 *
 * @return {ReactElement} The terminal panel
 */
const TerminalPanel = () => {
    const collapseStatus = useAtomValue(collapseStatusAtom);
    const { terminalTheme } = useAtomValue(terminalSettingsAtom);
    const [panelHeight, setPanelHeight] = useAtom(panelHeightAtom);
    const containerRef = useRef(null);

    const terminalRef = useTerminal(containerRef);

    const terminalBg = useMemo(
        () => (TERMINAL_THEMES[terminalTheme] ?? TERMINAL_THEMES.default).background,
        [terminalTheme],
    );

    return (
        <Collapse in={collapseStatus}>
            <Resizable
                style={{
                    backgroundColor: terminalBg,
                }}
                defaultSize={{
                    width: '100%',
                    height: panelHeight,
                }}
                enable={{
                    top: collapseStatus,
                }}
                maxHeight={'70vh'}

                // fix shitty bug with width calculation
                maxWidth={'100%'}
                onResizeStop={(event, direction, elementRef) => {
                    setPanelHeight(elementRef.offsetHeight);
                    requestAnimationFrame(() => terminalRef.current?.fit());
                }}
            >
                <div
                    ref={containerRef}
                    className={'w-100 h-100'}
                />
            </Resizable>
        </Collapse>
    );
};

/**
 * Terminal component with collapsible and resizable xterm.js terminal.
 *
 * @return {ReactElement} The Terminal component
 */
const Terminal = () => {
    const terminalStatus = useAtomValue(terminalStatusAtom);

    useTerminalStatusEvent();

    return (
        <>
            {terminalStatus && (
                <div className={'flex-shrink-0'}>
                    <TerminalHeader />
                    <TerminalPanel />
                </div>
            )}
        </>
    );
};

export default Terminal;
