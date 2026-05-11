/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo, useEffect } from 'react';

const DEFAULT_PAGE_SIZE = 25;

/**
 * Provides pagination over an in-memory array.
 * Resets to page 1 when data changes (e.g., after search filter).
 *
 * @param {Array} data - The full data array to paginate.
 * @param {number} pageSize - Number of items per page.
 * @return {{ pageData: Array, currentPage: number, totalPages: number, setCurrentPage: Function }} Pagination state and controls.
 */
const usePagination = (data, pageSize = DEFAULT_PAGE_SIZE) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => (
        Math.max(1, Math.ceil(data.length / pageSize))
    ), [data.length, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const pageData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    return { pageData, currentPage, totalPages, setCurrentPage };
};

export default usePagination;
