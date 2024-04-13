import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Generates a select form field with validation feedback.
 *
 * @param {String} name - the name of the field
 * @param {String} label - the label for the field
 * @param {Array} options - the options for the select field, can be an array of objects with label and value or an array of strings.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} the rendered select field component
 */
const SelectField = ({ name, label, options, ...rest }) => {
    const { register, setValue, formState: { errors } } = useFormContext();
    const isOptionObject = options.length > 0 && typeof options[0] === 'object';

    useEffect(() => {
        if (options.length > 0) {
            const defaultValue = isOptionObject ? options[0].value : options[0];
            setValue(name, defaultValue);
        }
    }, [options, setValue, name, isOptionObject]);

    return (
        <Form.Group className={'mb-3'}>
            <Form.Label htmlFor={name}>{label}</Form.Label>
            <Form.Select
                id={name}
                isInvalid={!!errors[name]}
                {...register(name)}
                {...rest}
            >
                {options.map((option, index) => {
                    const value = isOptionObject ? option.value : option;
                    const label = isOptionObject ? option.label : option;
                    return (
                        <option key={index} value={value}>
                            {label}
                        </option>
                    );
                })}
            </Form.Select>
            {errors[name] && (
                <Form.Control.Feedback type={'invalid'}>
                    {errors[name].message}
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
};

SelectField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    options: PropTypes.oneOfType([
        PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]).isRequired,
            })
        ),
        PropTypes.arrayOf(
            PropTypes.string.isRequired,
        ),
    ]).isRequired,
};

export default SelectField;
