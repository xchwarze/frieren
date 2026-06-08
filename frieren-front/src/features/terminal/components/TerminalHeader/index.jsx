/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtom, useAtomValue } from 'jotai';

import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js';
import useCloseTerminalMutation from '@src/features/terminal/hooks/useCloseTerminalMutation.js';
import Button from '@src/components/Button';

/**
 * Terminal header component. Used to display the status and close button.
 *
 * @return {ReactElement} The rendered terminal header component
 */
const TerminalHeader = () => {
    const [collapseStatus, setCollapseStatus] = useAtom(collapseStatusAtom);
    const socketStatus = useAtomValue(socketStatusAtom);
    const { mutate: closeTerminalMutation } = useCloseTerminalMutation();
    const isOffline = socketStatus === 'disconnected';

    return (
        <div className={`d-flex justify-content-between align-items-center w-100 text-white user-select-none ${isOffline ? 'bg-danger' : 'bg-secondary'}`}>
            <Button
                variant={`${isOffline ? 'danger' : 'secondary'}`}
                icon={`${collapseStatus ? 'chevron-down' : 'chevron-up'}`}
                title={collapseStatus ? 'Expand terminal' : 'Collapse terminal'}
                onClick={() => setCollapseStatus(!collapseStatus)}
            />
            <span>Terminal {`${isOffline ? '(DEAD)' : ''}`}</span>
            <Button
                variant={`${isOffline ? 'danger' : 'secondary'}`}
                icon={'x'}
                title={'Close terminal'}
                onClick={closeTerminalMutation}
            />
        </div>
    );
};

export default TerminalHeader;
