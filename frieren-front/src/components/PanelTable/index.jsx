/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Table from 'react-bootstrap/Table';
import PropTypes from 'prop-types';

const PanelTable = ({ children, ...rest }) => (
    <Table striped hover responsive {...rest}>
        {children}
    </Table>
);

PanelTable.propTypes = { children: PropTypes.node };

export default PanelTable;
