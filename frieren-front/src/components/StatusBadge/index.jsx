/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';

/**
 * Maps a semantic status word to a Bootstrap variant. Single source of the
 * status→color rule. Callers pass the status word that fits their context
 * (e.g. an unused interface is `down` = neutral grey, while an enabled-but-down
 * radio is `degraded` = warning) and the component owns the colour.
 *
 *   success   (green)  → operational: up · running · connected · active · enabled
 *   secondary (grey)   → inactive/off: down · stopped · disabled · idle · inactive
 *   warning   (yellow) → transitional/attention: pending · degraded · connecting
 *   danger    (red)    → real fault: error · failed · fault
 */
const STATUS_VARIANTS = {
    up: 'success',
    running: 'success',
    connected: 'success',
    active: 'success',
    enabled: 'success',
    online: 'success',

    down: 'secondary',
    stopped: 'secondary',
    disabled: 'secondary',
    idle: 'secondary',
    inactive: 'secondary',
    offline: 'secondary',

    pending: 'warning',
    degraded: 'warning',
    connecting: 'warning',

    error: 'danger',
    failed: 'danger',
    fault: 'danger',
};

/**
 * Renders a status Badge whose colour is derived from a semantic status word.
 *
 * @param {String} status - Semantic status word (see STATUS_VARIANTS).
 * @param {ReactNode} [children] - Display label; falls back to the status word.
 * @param {String} [className] - Extra classes.
 * @return {ReactNode} The status badge.
 */
const StatusBadge = ({ status, children, className = '', ...rest }) => {
    const variant = STATUS_VARIANTS[String(status).toLowerCase()] ?? 'secondary';

    return (
        <Badge
            bg={variant}
            text={variant === 'warning' ? 'dark' : undefined}
            className={className}
            {...rest}
        >
            {children ?? status}
        </Badge>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
};

export default StatusBadge;
