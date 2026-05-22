/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useRef } from 'react';
import { Resizable } from 're-resizable';
import Collapse from 'react-bootstrap/Collapse';
import { useAtomValue } from 'jotai'

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import useTerminalStatusEvent from '@src/features/terminal/hooks/useTerminalStatusEvent.js';
import TerminalHeader from '@src/features/terminal/components/TerminalHeader';

const modulesFolder = import.meta.env.VITE_WEB_MODULES_FOLDER;
const terminalIframeSrc = `${window.location.origin}/${modulesFolder}/terminal/inline.html`;
const defaultHeight = 200;

/**
 * Terminal component with collapsible and iframe functionality.
 *
 * @return {ReactElement} The Terminal component
 */
const Terminal = () => {
    const collapseStatus = useAtomValue(collapseStatusAtom);
    const terminalStatus = useAtomValue(terminalStatusAtom)
    const iframeRef = useRef(null);

    useTerminalStatusEvent(iframeRef, terminalStatus);

    return (
        <>
            {terminalStatus && (
                <div
                    style={{
                        // xterm background color
                        backgroundColor: '#2b2b2b',
                    }}
                >
                    <TerminalHeader />
                    <Collapse in={collapseStatus}>
                        <Resizable
                            defaultSize={{
                                width: '100%',
                                height: defaultHeight,
                            }}
                            enable={{
                                top: collapseStatus,
                            }}
                            onResizeStop={(event, direction, elementRef, delta) => {
                                const currentHeight = parseInt(iframeRef.current.style.height);
                                iframeRef.current.style.height = `${currentHeight + delta.height}px`;
                            }}
                            maxHeight={'80vh'}

                            // fix shitty bug with width calculation
                            maxWidth={'100%'}
                        >
                            <iframe
                                ref={iframeRef}
                                src={terminalIframeSrc}
                                style={{
                                    width: '100%',
                                    height: defaultHeight,
                                    backgroundColor: '#2b2b2b',
                                }}
                                className={'p-2'}
                            />
                        </Resizable>
                    </Collapse>
                </div>
            )}
        </>
    );
};

export default Terminal;
