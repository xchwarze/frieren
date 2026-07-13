/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Captures the browser's local time as an epoch (seconds) plus a whole-hour GMT
 * offset string, matching what the backend expects (date -s + uci timezone).
 * Shared by the settings "sync from browser" button and the login flow.
 *
 * @return {{ datetime: number, timezone: string }}
 */
export const retrieveBrowserDatetime = () => {
    const now = new Date();
    const offsetHours = Math.round(-now.getTimezoneOffset() / 60);
    const sign = offsetHours >= 0 ? '+' : '-';

    return {
        datetime: Math.floor(Date.now() / 1000),
        timezone: `GMT${sign}${Math.abs(offsetHours)}`,
    };
};
