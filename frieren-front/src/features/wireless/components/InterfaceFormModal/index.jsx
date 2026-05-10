/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import InterfaceFormLoader from './InterfaceFormLoader';

const InterfaceFormModal = ({ show, onHide, radio, section, initialValues }) => {
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
};

export default InterfaceFormModal;
