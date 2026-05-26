/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useForm, FormProvider as HookFormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

/**
 * Generates a form provider for the given children, onSubmit function, schema, and default values.
 *
 * @param {ReactNode} children - The child components to be rendered within the form provider.
 * @param {(values: any, methods: Object) => Promise<any>} onSubmit - Async submit handler.
 *        Receives form values and react-hook-form methods (reset, setValue, etc.).
 *        MUST return a Promise. Form state `isSubmitting` remains true
 *        until the Promise resolves or rejects.
 * @param {Object} schema - The schema to be used for form validation.
 * @param {Object} defaultValues - The default values for the form fields.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} The form provider component.
 */
const FormProvider = ({ children, onSubmit, schema, defaultValues, ...rest }) => {
    const methods = useForm({
        resolver: schema ? yupResolver(schema) : undefined,
        defaultValues,
        values: defaultValues,
    });

    return (
        <HookFormProvider {...methods}>
            <Form onSubmit={methods.handleSubmit((values) => onSubmit(values, methods))} noValidate={true} className={'mt-3'} {...rest}>
                {children}
            </Form>
        </HookFormProvider>
    );
};

FormProvider.propTypes = {
    children: PropTypes.node.isRequired,
    onSubmit: PropTypes.func.isRequired,
    defaultValues: PropTypes.object,
    schema: PropTypes.object,
};

export default FormProvider;
