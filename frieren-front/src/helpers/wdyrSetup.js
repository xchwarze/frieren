/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as React from 'react';

// from https://github.com/welldone-software/why-did-you-render/issues/243
if (import.meta.env.DEV) {
    const { default: wdyr } = await import('@welldone-software/why-did-you-render');

    wdyr(React, {
        trackHooks: true,
        trackAllPureComponents: true,
    });
}
