/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the given value.
 *
 * @param {*} value - The value to debounce.
 * @param {number} delay - Debounce delay in milliseconds.
 * @return {*} The debounced value.
 */
const useDebouncedValue = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

export default useDebouncedValue;
