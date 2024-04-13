/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
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
