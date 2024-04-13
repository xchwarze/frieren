import { useFormContext } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Generates a checkbox form field with validation feedback.
 *
 * @param {String} name - the name of the checkbox field
 * @param {String} label - the label text for the checkbox
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} the checkbox form field component
 */
const CheckboxField = ({ name, label, ...rest }) => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <Form.Group className={'mb-3'}>
            <Form.Check
                id={name}
                type={'checkbox'}
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

CheckboxField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default CheckboxField;
