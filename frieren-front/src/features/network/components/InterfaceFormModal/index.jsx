/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { DEFAULT_PROTO } from '@src/features/network/helpers/constants.js';
import InterfaceForm from './InterfaceForm';

/**
 * Modal wrapper that hosts the interface configuration form.
 *
 * @param {Boolean} show - Whether the modal is visible.
 * @param {Function} onHide - Callback to close the modal.
 * @param {Object} iface - The interface being edited.
 * @return {ReactElement} The InterfaceFormModal component.
 */
const InterfaceFormModal = ({ show, onHide, iface }) => {
    const defaultValues = {
        proto: iface?.proto ?? DEFAULT_PROTO,
        ipaddr: iface?.ipaddr ?? '',
        netmask: iface?.netmask ?? '',
        gateway: iface?.gateway ?? '',
        // dns is an array on the wire; the form edits it as a space-separated string.
        dns: Array.isArray(iface?.dns) ? iface.dns.join(' ') : (iface?.dns ?? ''),
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Interface</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {show && iface && (
                    <InterfaceForm
                        name={iface.name}
                        defaultValues={defaultValues}
                        onHide={onHide}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

InterfaceFormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    iface: PropTypes.object,
};

export default InterfaceFormModal;
