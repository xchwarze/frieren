/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useFormContext } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Generates a switch form field with validation feedback.
 *
 * @param {String} name - the name of the switch field
 * @param {String} label - the label text for the switch
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} the checkbox form field component
 */
const SwitchField = ({ name, label, ...rest }) => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <Form.Group className={'mb-3'}>
            <Form.Check
                id={name}
                type={'switch'}
                label={label}
                isInvalid={!!errors[name]}
                {...register(name)}
                {...rest}
            />
            {errors[name] && (
                <Form.Control.Feedback type={'invalid'}>
                    {errors[name].message}
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
};

SwitchField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default SwitchField;
