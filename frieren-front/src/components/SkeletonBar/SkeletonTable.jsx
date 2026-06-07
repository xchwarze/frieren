/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

import SkeletonBar from '@src/components/SkeletonBar';

/**
 * Renders a skeleton placeholder table with animated bars in each cell.
 *
 * @param {Array<string>} [headers] - Column header labels. Omit for headerless tables.
 * @param {Array<number>} widths - Skeleton bar width for each column.
 * @param {number} [rows=3] - Number of skeleton rows to render.
 * @param {string} [className] - Additional CSS class for the Table element.
 * @return {ReactElement}
 */
const SkeletonTable = ({ headers, widths, rows = 3, className }) => (
    <Table className={className} aria-hidden={'true'} striped hover responsive>
        {headers && (
            <thead>
                <tr>
                    {headers.map((header, i) => (
                        <th key={i}>{header}</th>
                    ))}
                </tr>
            </thead>
        )}
        <tbody>
            {Array.from({ length: rows }, (_, rowIdx) => (
                <tr key={rowIdx}>
                    {widths.map((width, colIdx) => (
                        <td key={colIdx}><SkeletonBar width={width} /></td>
                    ))}
                </tr>
            ))}
        </tbody>
    </Table>
);

SkeletonTable.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.string),
    widths: PropTypes.arrayOf(PropTypes.number).isRequired,
    rows: PropTypes.number,
    className: PropTypes.string,
};

export default SkeletonTable;
