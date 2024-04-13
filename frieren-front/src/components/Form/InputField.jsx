import { useFormContext } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Generates an input form field with validation feedback.
 *
 * @param {String} name - The name of the input field.
 * @param {String} label - The label for the input field.
 * @param {String} type - The type of input field (default is 'text').
 * @param {String} placeholder - The placeholder text for the input field.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} The input field component.
 */
const InputField = ({ name, label, type = 'text', placeholder = '', ...rest }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <Form.Group className={'mb-3'}>
            <Form.Label htmlFor={name}>{label}</Form.Label>
            <Form.Control
                id={name}
                type={type}
                placeholder={placeholder}
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

InputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    placeholder: PropTypes.string,
};

export default InputField;
