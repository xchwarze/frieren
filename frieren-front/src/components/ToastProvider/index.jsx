/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { ToastContainer } from 'react-toastify';

import useResolvedTheme from '@src/hooks/useResolvedTheme.js';

/**
 * Wrapper component that provides a theme-aware ToastContainer.
 *
 * @return {ReactElement} The toast container.
 */
const ToastProvider = () => {
    const theme = useResolvedTheme();

    return <ToastContainer theme={theme} />;
};

export default ToastProvider;
