/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

/**
 * Renders a right-aligned action row for form/modal footers.
 *
 * @param {ReactNode} children - The action buttons to render inside the row.
 * @return {ReactElement} The rendered action row.
 */
const FormActions = ({ children }) => (
    <div className={'d-flex justify-content-end gap-2'}>
        {children}
    </div>
);

FormActions.propTypes = {
    children: PropTypes.node,
};

export default FormActions;
