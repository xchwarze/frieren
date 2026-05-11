/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { ToastContainer } from 'react-toastify';
import { useAtomValue } from 'jotai';

import themeVariantAtom from '@src/atoms/themeVariantAtom.js';

/**
 * A dummy component that is used as a wrapper for the useApplyTheme hook.
 *
 * @return {null} Returns null.
 */
const ToastProvider = () => {
    const themeVariant = useAtomValue(themeVariantAtom);
    const effectiveTheme = themeVariant === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : themeVariant;

    return <ToastContainer theme={effectiveTheme} />;
};

export default ToastProvider;
