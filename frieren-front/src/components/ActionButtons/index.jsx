/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

const ActionButtons = ({ children }) => (
    <div className={'d-flex gap-1'}>
        {children}
    </div>
);

ActionButtons.propTypes = { children: PropTypes.node };

export default ActionButtons;
