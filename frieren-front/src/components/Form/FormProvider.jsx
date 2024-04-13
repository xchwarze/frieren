import { useEffect } from 'react';
import { useForm, FormProvider as HookFormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

/**
 * Generates a form provider for the given children, onSubmit function, schema, and default values.
 *
 * @param {ReactNode} children - The child components to be rendered within the form provider.
 * @param {Function} onSubmit - The function to be called when the form is submitted.
 * @param {Object} schema - The schema to be used for form validation.
 * @param {Object} defaultValues - The default values for the form fields.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} The form provider component.
 */
const FormProvider = ({ children, onSubmit, schema, defaultValues, ...rest }) => {
    const methods = useForm({
        resolver: schema ? yupResolver(schema) : undefined,
        defaultValues,
    });

    useEffect(() => {
        if (!methods?.formState.isSubmitted) {
            methods.reset(defaultValues);
        }
    }, [defaultValues, methods]);

    return (
        <HookFormProvider {...methods}>
            <Form onSubmit={methods.handleSubmit(onSubmit)} noValidate={true} className={'mt-3'} {...rest}>
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
