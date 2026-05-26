/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';

import themeVariantAtom from '@src/atoms/themeVariantAtom.js';

const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/**
 * Resolves the current theme variant to 'dark' or 'light',
 * handling the 'auto' case via system preference with live updates.
 *
 * @return {string} The resolved theme: 'dark' or 'light'.
 */
const useResolvedTheme = () => {
    const themeVariant = useAtomValue(themeVariantAtom);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    useEffect(() => {
        if (themeVariant !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [themeVariant]);

    return themeVariant === 'auto' ? systemTheme : themeVariant;
};

export default useResolvedTheme;
