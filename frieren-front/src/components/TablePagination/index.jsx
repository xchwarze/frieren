/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMemo } from 'react';
import Pagination from 'react-bootstrap/Pagination';
import PropTypes from 'prop-types';

const MAX_VISIBLE_PAGES = 5;

/**
 * Renders pagination controls for a table.
 *
 * @param {number} currentPage - The current active page (1-based).
 * @param {number} totalPages - Total number of pages.
 * @param {Function} onPageChange - Callback when a page is selected.
 * @param {number} totalItems - Total number of items in the dataset.
 * @param {number} pageSize - Number of items per page.
 * @return {ReactElement|null} The pagination component, or null if only one page.
 */
const TablePagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize = 25 }) => {
    const pageNumbers = useMemo(() => {
        if (totalPages <= MAX_VISIBLE_PAGES) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(MAX_VISIBLE_PAGES / 2);
        let start = Math.max(1, currentPage - half);
        let end = start + MAX_VISIBLE_PAGES - 1;
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [currentPage, totalPages]);

    if (totalPages <= 1) {
        return null;
    }

    const showStartEllipsis = pageNumbers[0] > 1;
    const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;
    const firstItemValue = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const lastItemValue = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={'d-flex justify-content-between align-items-center mt-3'}>
            <small className={'text-body-secondary'}>
                {firstItemValue}-{lastItemValue} of {totalItems} items
            </small>
            <Pagination className={'mb-0'}>
                <Pagination.First
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                />
                <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                />

                {showStartEllipsis && (
                    <>
                        <Pagination.Item onClick={() => onPageChange(1)}>1</Pagination.Item>
                        <Pagination.Ellipsis disabled />
                    </>
                )}

                {pageNumbers.map((page) => (
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Pagination.Item>
                ))}

                {showEndEllipsis && (
                    <>
                        <Pagination.Ellipsis disabled />
                        <Pagination.Item onClick={() => onPageChange(totalPages)}>{totalPages}</Pagination.Item>
                    </>
                )}

                <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                />
                <Pagination.Last
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                />
            </Pagination>
        </div>
    );
};

TablePagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalItems: PropTypes.number.isRequired,
    pageSize: PropTypes.number,
};

export default TablePagination;
