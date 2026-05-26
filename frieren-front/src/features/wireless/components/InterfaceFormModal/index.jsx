/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import InterfaceFormLoader from './InterfaceFormLoader';

const InterfaceFormModal = ({ show, onHide, radio, section, initialValues, onInterfaceSaved }) => {
    const isEditMode = !!section;
    const title = isEditMode ? 'Edit Interface' : 'Add Interface';

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {show && (
                    <InterfaceFormLoader
                        radio={radio}
                        section={section}
                        onHide={onHide}
                        initialValues={initialValues}
                        onInterfaceSaved={onInterfaceSaved}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

InterfaceFormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    radio: PropTypes.string,
    section: PropTypes.string,
    initialValues: PropTypes.object,
    onInterfaceSaved: PropTypes.func,
};

export default InterfaceFormModal;
