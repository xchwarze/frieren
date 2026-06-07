/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

/**
 * Vertical stack of panel cards with consistent card-to-card spacing.
 *
 * @param {ReactNode} children - The cards to stack.
 * @return {ReactNode} The stack wrapper.
 */
const PanelStack = ({ children }) => (
    <div className={'d-flex flex-column gap-3'}>
        {children}
    </div>
);

PanelStack.propTypes = { children: PropTypes.node };

export default PanelStack;
