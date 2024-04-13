/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import Button from 'react-bootstrap/Button';
import { useAtom, useAtomValue } from 'jotai';

import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js';
import useCloseTerminalMutation from '@src/features/terminal/hooks/useCloseTerminalMutation.js';
import Icon from '@src/components/Icon';

/**
 * Terminal header component. Used to display the status and close button.
 *
 * @return {ReactElement} The rendered terminal header component
 */
const TerminalHeader = () => {
    const [collapseStatus, setCollapseStatus] = useAtom(collapseStatusAtom);
    const socketStatus = useAtomValue(socketStatusAtom);
    const { mutate: closeTerminalMutation } = useCloseTerminalMutation();
    const isOffline = socketStatus === 'offline';

    return (
        <div className={`d-flex justify-content-between align-items-center w-100 text-white user-select-none ${isOffline ? 'bg-danger' : 'bg-secondary'}`}>
            <Button
                variant={`${isOffline ? 'danger' : 'secondary'}`}
                onClick={() => setCollapseStatus(!collapseStatus)}
            >
                <Icon name={`${collapseStatus ? 'chevron-down' : 'chevron-up'}`}/>
            </Button>
            <span>Terminal {`${isOffline ? '(DEAD)' : ''}`}</span>
            <Button
                variant={`${isOffline ? 'danger' : 'secondary'}`}
                onClick={closeTerminalMutation}
            >
                <Icon name={'x'}/>
            </Button>
        </div>
    );
};

export default TerminalHeader;
