/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import BaseButton from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders a Button component with icon, optional label, and loading state.
 *
 * @param {String} label - The label to be displayed on the button.
 * @param {String} icon - The name of the icon to be displayed on the button.
 * @param {Boolean} disabled - A flag to indicate if the button is disabled.
 * @param {Boolean} loading - Flag indicating if the button is in a loading state.
 * @param {Object} rest - Additional props to be spread onto the BaseButton component.
 * @return {ReactElement} The rendered Button component.
 */
const Button = ({ label, icon, disabled, loading, 'aria-label': ariaLabel, ...rest}) => (
    <BaseButton
        variant={'primary'}
        disabled={disabled || loading}
        aria-label={ariaLabel || label || icon}
        {...rest}
    >
        <span className={'d-inline-flex align-items-center gap-1'}>
            {loading ? (
                <Spinner animation={'border'} size={'sm'} />
            ) : (
                <Icon name={icon}/>
            )}
            {label && <span>{label}</span>}
        </span>
    </BaseButton>
);

Button.propTypes = {
    label: PropTypes.string,
    icon: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    'aria-label': PropTypes.string,
};

export default Button;
