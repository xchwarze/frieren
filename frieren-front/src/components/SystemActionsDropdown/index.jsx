/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';

import useResetMutation from '@src/hooks/useResetMutation';
import useShutDownMutation from '@src/hooks/useShutDownMutation';
import useUserLogoutMutation from '@src/hooks/useUserLogoutMutation';
import Icon from '@src/components/Icon';
import ConfirmationModal from '@src/components/ConfirmationModal';
import AboutModal from '@src/components/AboutModal';
import SystemStatusModal from '@src/components/SystemStatusModal';

/**
 * Actions for system control.
 */
const RESET_ACTION = 'reset';
const SHUTDOWN_ACTION = 'shutdown';

const ACTION_TO_STATUS = {
    [RESET_ACTION]: 'restart',
    [SHUTDOWN_ACTION]: 'shutdown',
};

/**
 * Dropdown component for system actions including reset, shutdown, and logout.
 * Provides confirmation modals for reset and shutdown actions, and a status
 * modal that tracks device state during restart or shutdown operations.
 *
 * @returns {ReactElement} The system actions dropdown with confirmation and status modals.
 */
const SystemActionsDropdown = () => {
    const resetMutation = useResetMutation();
    const shutDownMutation = useShutDownMutation();
    const { mutate: logoffMutation } = useUserLogoutMutation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState('');
    const [systemStatus, setSystemStatus] = useState(null);
    const [showAbout, setShowAbout] = useState(false);

    const handleConfirm = () => {
        const mutation = currentAction === RESET_ACTION ? resetMutation : shutDownMutation;
        const status = ACTION_TO_STATUS[currentAction];

        mutation.mutate(undefined, {
            onSuccess: () => {
                handleCloseModal();
                setSystemStatus(status);
            },
        });
    };

    const handleOpenModal = (action) => {
        setCurrentAction(action);
        setShowConfirmModal(true);
    };

    const handleCloseModal = () => {
        setShowConfirmModal(false);
        setCurrentAction('');
    };

    const isActionPending = resetMutation.isPending || shutDownMutation.isPending;

    return (
        <>
            <NavDropdown title={<Icon name={'more-vertical'} />} align={'end'}>
                <NavDropdown.Item onClick={() => setShowAbout(true)}>
                    <Icon name={'github'} /> About
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleOpenModal(RESET_ACTION)}>
                    <Icon name={'rotate-cw'} /> Reset hardware
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleOpenModal(SHUTDOWN_ACTION)}>
                    <Icon name={'power'} /> Shut Down hardware
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoffMutation}>
                    <Icon name={'log-out'} /> Logout
                </NavDropdown.Item>
            </NavDropdown>
            <ConfirmationModal
                show={showConfirmModal}
                onHide={handleCloseModal}
                onConfirm={handleConfirm}
                title={`Confirm ${currentAction}`}
                description={`Are you sure you want to ${currentAction} the hardware?`}
                isConfirmLoading={isActionPending}
            />
            <AboutModal
                show={showAbout}
                onHide={() => setShowAbout(false)}
            />
            <SystemStatusModal action={systemStatus} />
        </>
    );
};

export default SystemActionsDropdown;
