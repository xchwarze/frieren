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
 * Accessible name and tooltip are derived so icon-only buttons are always labelled:
 * - aria-label: label, else title, else icon name.
 * - title (tooltip): explicit title, else label.
 *
 * @param {String} label - Visible text; also used as accessible name and tooltip when set.
 * @param {String} title - Tooltip text; also used as accessible name when no label is set.
 * @param {String} icon - The name of the icon to be displayed on the button.
 * @param {Boolean} disabled - A flag to indicate if the button is disabled.
 * @param {Boolean} loading - Flag indicating if the button is in a loading state.
 * @param {ReactNode} children - Custom content rendered after the icon/label (escape hatch for non-icon-font content).
 * @param {Object} rest - Additional props to be spread onto the BaseButton component.
 * @return {ReactElement} The rendered Button component.
 */
const Button = ({ label, title, icon, disabled, loading, children, ...rest}) => (
    <BaseButton
        variant={'primary'}
        disabled={disabled || loading}
        {...rest}
        aria-label={label || title || icon}
        title={title || label}
    >
        <span className={'d-inline-flex align-items-center gap-1'}>
            {loading ? (
                <Spinner animation={'border'} size={'sm'} />
            ) : (
                icon && <Icon name={icon}/>
            )}
            {label && <span>{label}</span>}
            {children}
        </span>
    </BaseButton>
);

Button.propTypes = {
    label: PropTypes.string,
    title: PropTypes.string,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    children: PropTypes.node,
};

export default Button;
