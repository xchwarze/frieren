import { useFormContext } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Generates a textarea form field with validation feedback.
 *
 * @param {String} name - the name of the field
 * @param {String} label - the label for the field
 * @param {String} placeholder - the placeholder text for the textarea
 * @param {Number} rows - the number of rows for the textarea
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} the TextAreaField component
 */
const TextAreaField = ({ name, label, placeholder = '', rows = 3, ...rest }) => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <Form.Group className={'mb-3'}>
            <Form.Label htmlFor={name}>{label}</Form.Label>
            <Form.Control
                as={'textarea'}
                id={name}
                rows={rows}
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

TextAreaField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
};

export default TextAreaField;
