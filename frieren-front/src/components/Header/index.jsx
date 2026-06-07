/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
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

const enableTerminal = import.meta.env.VITE_ENABLE_TERMINAL === 'true';

/**
 * Generate the header component with logo and other tools.
 *
 * @return {ReactElement} The header component
 */
const Header = () => {
    const { mutate: openTerminalMutation } = useOpenTerminalMutation();
    const terminalStatus = useAtomValue(terminalStatusAtom);

    return (
        <Navbar id={'header'} className={'bg-body-tertiary px-3'}>
            <Navbar.Brand>
                <img
                    alt={''}
                    src={logoImage}
                    width={'32'}
                    height={'32'}
                    className={'d-inline-block align-top me-2'}
                />
                Frieren
            </Navbar.Brand>
            <div className={'navbar-nav flex-row flex-wrap ms-auto'}>
                {enableTerminal && (
                    <Button
                        variant={'outline-primary'}
                        className={'btn-icon fs-5'}
                        aria-label={'Open terminal'}
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
