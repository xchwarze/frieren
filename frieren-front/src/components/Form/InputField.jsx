/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
                style={{ cursor: 'pointer' }}
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

/**
 * Generates an input form field with validation feedback.
 * Password fields automatically get a visibility toggle button.
 *
 * @param {String} name - The name of the input field.
 * @param {String} label - The label for the input field.
 * @param {String} type - The type of input field (default is 'text').
 * @param {String} placeholder - The placeholder text for the input field.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} The input field component.
 */
const InputField = ({ name, label, type = 'text', placeholder = '', ...rest }) => {
    const { register, formState: { errors } } = useFormContext();
    const isPassword = type === 'password';
    const errorMessage = errors[name]?.message;

    const renderControl = (resolvedType) => (
        <Form.Control
            id={name}
            type={resolvedType}
            placeholder={placeholder}
            isInvalid={!!errors[name]}
            {...register(name)}
            {...rest}
        />
    );

    return (
        <Form.Group className={'mb-3'}>
            <Form.Label htmlFor={name}>{label}</Form.Label>
            {isPassword ? (
                <PasswordHelper errorMessage={errorMessage}>
                    {(showPassword) => renderControl(showPassword ? 'text' : 'password')}
                </PasswordHelper>
            ) : (
                <>
                    {renderControl(type)}
                    {errorMessage && (
                        <Form.Control.Feedback type={'invalid'}>
                            {errorMessage}
                        </Form.Control.Feedback>
                    )}
                </>
            )}
        </Form.Group>
    );
};

InputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    placeholder: PropTypes.string,
};

export default InputField;
