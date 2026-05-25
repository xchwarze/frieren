/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal, Button } from 'react-bootstrap';
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
const ConfirmationModal = ({ show, onHide, onConfirm, title, description, children }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {description}
            {children}
        </Modal.Body>
        <Modal.Footer>
            <Button variant={'secondary'} onClick={onHide}>
                Cancel
            </Button>
            <Button variant={'danger'} onClick={onConfirm}>
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
    description: PropTypes.string,
    children: PropTypes.node,
};

export default ConfirmationModal;
