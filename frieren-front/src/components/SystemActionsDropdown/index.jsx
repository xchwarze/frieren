import { useState } from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useLocation } from 'wouter';

import useResetMutation from '@src/hooks/useResetMutation';
import useShutDownMutation from '@src/hooks/useShutDownMutation';
import useUserLogoutMutation from '@src/hooks/useUserLogoutMutation';
import Icon from '@src/components/Icon';
import ConfirmationModal from '@src/components/ConfirmationModal';

/**
 * Actions for system control.
 */
const RESET_ACTION = 'reset';
const SHUTDOWN_ACTION = 'shutdown';

/**
 * Dropdown component for system actions including reset, shutdown, and logout.
 * Provides confirmation modals for reset and shutdown actions.
 *
 * @returns {ReactElement} The system actions dropdown with confirmation modals.
 */
const SystemActionsDropdown = () => {
    const { mutate: resetMutation } = useResetMutation();
    const { mutate: shutDownMutation } = useShutDownMutation();
    const { mutate: logoffMutation } = useUserLogoutMutation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState('');
    const [, navigate] = useLocation();

    const handleConfirm = () => {
        if (currentAction === RESET_ACTION) {
            resetMutation();
        } else if (currentAction === SHUTDOWN_ACTION) {
            shutDownMutation();
        }
        handleCloseModal();
    };

    const handleOpenModal = (action) => {
        setCurrentAction(action);
        setShowConfirmModal(true);
    };

    const handleCloseModal = () => {
        setShowConfirmModal(false);
        setCurrentAction('');
    };

    return (
        <>
            <NavDropdown title={<Icon name={'more-vertical'} />} align={'end'}>
                <NavDropdown.Item onClick={() => navigate('/about')}>
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
            />
        </>
    );
};

export default SystemActionsDropdown;
