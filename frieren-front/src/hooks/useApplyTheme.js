/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect } from 'react';

import useResolvedTheme from '@src/hooks/useResolvedTheme.js';

/**
 * Applies the resolved theme to the document root element for Bootstrap dark mode support.
 * @return {void}
 */
const useApplyTheme = () => {
    const theme = useResolvedTheme();

    // Bootstrap darkmode support
    // based on: https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);
};

export default useApplyTheme;

