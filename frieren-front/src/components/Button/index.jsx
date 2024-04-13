import BaseButton from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders a Button component with the specified label, icon, and disabled state.
 *
 * @param {String} label - The label to be displayed on the button.
 * @param {String} icon - The name of the icon to be displayed on the button.
 * @param {Boolean} disabled - A flag to indicate if the button is disabled.
 * @param {Boolean} loading - Flag indicating if the button is in a loading state.
 * @param {Object} rest - Additional props to be spread onto the BaseButton component.
 * @return {ReactElement} The rendered Button component.
 */
const Button = ({ label, icon, disabled, loading, ...rest}) => (
    <BaseButton variant={'primary'} disabled={disabled || loading} {...rest}>
        <Icon name={icon}/> {label}
        <Spinner animation={'border'} className={'ms-2'} size={'sm'} hidden={!loading} />
    </BaseButton>
);

Button.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool
};

export default Button;
