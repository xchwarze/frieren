/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { useAtomValue } from 'jotai';

import logoImage from '@src/assets/logo.png';
import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import useOpenTerminalMutation from '@src/features/terminal/hooks/useOpenTerminalMutation.js';
import SystemActionsDropdown from '@src/components/SystemActionsDropdown';
import Icon from '@src/components/Icon';

/**
 * Generate the header component with logo and other tools.
 *
 * @return {ReactElement} The header component
 */
const Header = () => {
    const { mutate: openTerminalMutation } = useOpenTerminalMutation();
    const terminalStatus = useAtomValue(terminalStatusAtom);
    const ENABLE_TERMINAL = import.meta.env.VITE_ENABLE_TERMINAL;

    // <Navbar bg="dark" variant="dark" fixed="top" className="px-3">
    return (
        <Navbar id={'header'} className={'bg-body-tertiary px-3'}>
            <Navbar.Brand>
                <img
                    alt={''}
                    src={logoImage}
                    width={'32'}
                    height={'32'}
                    className={'d-inline-block align-top'}
                />{' '}
                Frieren
            </Navbar.Brand>
            <div className={'navbar-nav flex-row flex-wrap ms-auto'}>
                {ENABLE_TERMINAL && (
                    <Button
                        variant={'outline-primary'}
                        className={'btn-icon fs-5'}
                        disabled={terminalStatus}
                        onClick={openTerminalMutation}
                    >
                        <Icon name={'terminal'} />
                    </Button>
                )}
                <SystemActionsDropdown />
            </div>
        </Navbar>
    );
};

export default Header;
