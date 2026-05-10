/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import RadioConfigForm from './RadioConfigForm';

const RadioConfigModal = ({ show, onHide, radioName, band }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>{`Radio Configuration — ${radioName} (${band || 'Unknown'})`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {show && <RadioConfigForm radio={radioName} onHide={onHide} />}
        </Modal.Body>
    </Modal>
);

RadioConfigModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    radioName: PropTypes.string,
    band: PropTypes.string,
};

export default RadioConfigModal;
