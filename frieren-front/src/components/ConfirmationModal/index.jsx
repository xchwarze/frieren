/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal, Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Renders a confirmation modal component.
 *
 * @param {Boolean} show - Determines whether the modal is shown or hidden.
 * @param {Function} onHide - The function to be called when the modal is hidden.
 * @param {Function} onConfirm - The function to be called when the confirm button is clicked.
 * @param {String} title - The title of the modal.
 * @param {String} description - The description of the modal.
 * @return {ReactElement} The rendered confirmation modal component.
 */
const ConfirmationModal = ({ show, onHide, onConfirm, title, description, isConfirmLoading, children }) => (
    <Modal show={show} onHide={isConfirmLoading ? undefined : onHide} backdrop={isConfirmLoading ? 'static' : true} centered>
        <Modal.Header closeButton={!isConfirmLoading}>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {description}
            {children}
        </Modal.Body>
        <Modal.Footer>
            <Button variant={'secondary'} onClick={onHide} disabled={isConfirmLoading}>
                Cancel
            </Button>
            <Button variant={'danger'} onClick={onConfirm} disabled={isConfirmLoading}>
                {isConfirmLoading && <Spinner animation={'border'} size={'sm'} className={'me-2'} />}
                Confirm
            </Button>
        </Modal.Footer>
    </Modal>
);

ConfirmationModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    isConfirmLoading: PropTypes.bool,
    children: PropTypes.node,
};

export default ConfirmationModal;
