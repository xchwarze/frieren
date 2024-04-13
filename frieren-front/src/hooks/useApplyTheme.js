import { useEffect } from 'react';
import { useAtomValue } from 'jotai';

import themeVariantAtom from '@src/atoms/themeVariantAtom.js';

/**
 * Applies the system theme to the document root element based on the user's preferred color scheme.
 *
 * @return {void} This function does not return anything.
 */
const useApplyTheme = () => {
    const themeVariant = useAtomValue(themeVariantAtom);

    // Bootstrap darkmode support
    // based on: https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
    useEffect(() => {
        const applyTheme = (themeValue) => {
            const effectiveTheme = themeValue === 'auto'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                : themeValue;
            document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
        };

        applyTheme(themeVariant);

        if (themeVariant === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const applySystemTheme = () => {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-bs-theme', systemTheme);
            };

            mediaQuery.addEventListener('change', applySystemTheme);

            return () => mediaQuery.removeEventListener('change', applySystemTheme);
        }
    }, [themeVariant]);
};

export default useApplyTheme;

