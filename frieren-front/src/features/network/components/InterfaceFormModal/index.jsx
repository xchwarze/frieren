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
 * Modal wrapper that hosts the interface configuration form. `iface === null` means
 * add mode: a blank name the user fills in, rather than an existing interface to edit.
 *
 * @param {Boolean} show - Whether the modal is visible.
 * @param {Function} onHide - Callback to close the modal.
 * @param {Object|null} iface - The interface being edited, or null to create a new one.
 * @return {ReactElement} The InterfaceFormModal component.
 */
const InterfaceFormModal = ({ show, onHide, iface }) => {
    const isEditMode = !!iface;
    const defaultValues = {
        name: iface?.name ?? '',
        device: iface?.device ?? '',
        proto: iface?.proto ?? DEFAULT_PROTO,
        ipaddr: iface?.ipaddr ?? '',
        netmask: iface?.netmask ?? '',
        gateway: iface?.gateway ?? '',
        // dns is an array on the wire; the form edits it as a space-separated string.
        dns: Array.isArray(iface?.dns) ? iface.dns.join(' ') : (iface?.dns ?? ''),
        mtu: iface?.mtu ?? '',
        macaddr: iface?.macaddr ?? '',
        peerdns: iface?.peerdns ?? true,
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Interface' : 'Add Interface'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {show && (
                    <InterfaceForm
                        isEditMode={isEditMode}
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
