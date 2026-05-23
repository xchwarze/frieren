/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMemo, useRef } from 'react';
import { Resizable } from 're-resizable';
import Collapse from 'react-bootstrap/Collapse';
import { useAtomValue } from 'jotai'

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import terminalThemeAtom from '@src/features/terminal/atoms/terminalThemeAtom.js';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import { TERMINAL_THEMES } from '@src/features/terminal/helpers/terminalThemes.js';
import useTerminal from '@src/features/terminal/hooks/useTerminal.js';
import useTerminalStatusEvent from '@src/features/terminal/hooks/useTerminalStatusEvent.js';
import TerminalHeader from '@src/features/terminal/components/TerminalHeader';

const DEFAULT_HEIGHT = 200;

/**
 * Inner terminal panel that mounts the xterm.js instance.
 * Separated so useTerminal only runs when the container div exists in the DOM.
 *
 * @return {ReactElement} The terminal panel
 */
const TerminalPanel = () => {
    const collapseStatus = useAtomValue(collapseStatusAtom);
    const themeName = useAtomValue(terminalThemeAtom);
    const containerRef = useRef(null);

    useTerminal(containerRef);

    const terminalBg = useMemo(
        () => (TERMINAL_THEMES[themeName] ?? TERMINAL_THEMES.default).background,
        [themeName],
    );

    return (
        <Collapse in={collapseStatus}>
            <Resizable
                defaultSize={{
                    width: '100%',
                    height: DEFAULT_HEIGHT,
                }}
                enable={{
                    top: collapseStatus,
                }}
                maxHeight={'80vh'}

                // fix shitty bug with width calculation
                maxWidth={'100%'}
            >
                <div
                    ref={containerRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: terminalBg,
                    }}
                    className={'pt-2 px-2 pb-4'}
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
                <div>
                    <TerminalHeader />
                    <TerminalPanel />
                </div>
            )}
        </>
    );
};

export default Terminal;
