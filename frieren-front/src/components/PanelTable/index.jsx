/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';

/**
 * Standard panel table: striped, hover, responsive. Drops Bootstrap's default
 * 1rem bottom margin (`mb-0`) so the card padding owns the bottom spacing and a
 * following paginator owns the gap above it — keeps card bottoms uniform.
 *
 * @param {String} [className] - Extra classes appended to the table.
 * @param {ReactNode} children - The table content (thead/tbody).
 * @return {ReactNode} The table.
 */
const PanelTable = ({ className = '', children, ...rest }) => (
    <Table striped hover responsive className={`mb-0 ${className}`.trim()} {...rest}>
        {children}
    </Table>
);

PanelTable.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

export default PanelTable;
