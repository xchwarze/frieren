/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Wraps a password input with a visibility toggle button and error feedback.
 * Accepts children as a render function receiving the current showPassword state.
 *
 * @param {Function} children - Render function: (showPassword: boolean) => ReactElement
 * @param {String} errorMessage - Validation error message to display.
 * @return {ReactElement} InputGroup with toggle button and optional error feedback.
 */
const PasswordHelper = ({ children, errorMessage }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputGroup>
            {children(showPassword)}
            <InputGroup.Text
                role={'button'}
                onClick={() => setShowPassword(v => !v)}
            >
                <Icon name={showPassword ? 'eye-off' : 'eye'} />
            </InputGroup.Text>
            {errorMessage && (
                <Form.Control.Feedback type={'invalid'}>
                    {errorMessage}
                </Form.Control.Feedback>
            )}
        </InputGroup>
    );
};

PasswordHelper.propTypes = {
    children: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
};

export default PasswordHelper;
