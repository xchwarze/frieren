/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Renders a non-editable, display-only form field.
 *
 * @param {String} label - The label text for the field.
 * @param {String} value - The value to display.
 * @param {Object} rest - Additional props to be spread on the control.
 * @return {ReactElement} The read-only form field component.
 */
const ReadOnlyField = ({ label, value, ...rest }) => (
    <Form.Group className={'mb-3'}>
        <Form.Label>{label}</Form.Label>
        <Form.Control value={value} disabled readOnly {...rest} />
    </Form.Group>
);

ReadOnlyField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
};

export default ReadOnlyField;
