import useApplyTheme from '@src/hooks/useApplyTheme.js';

/**
 * A dummy component that is used as a wrapper for the useApplyTheme hook.
 *
 * @return {null} Returns null.
 */
const ThemeVariantApplier = () => {
    useApplyTheme();

    return null;
};

export default ThemeVariantApplier;
