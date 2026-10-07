/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

// Built once, use the browser's own locale (undefined) + zone. RelativeTimeFormat for
// the last hour reads naturally ("5 minutes ago"); past that, the absolute local
// date/time in whatever format the operator's locale prefers.
const ABSOLUTE_TIME_FMT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const DATE_ONLY_FMT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
const RELATIVE_TIME_FMT = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/**
 * Formats an epoch-seconds timestamp for display in the viewer's local format: a
 * locale-aware relative string within the last hour, else the local date + time.
 *
 * @param {number} epoch - Unix time in seconds.
 * @return {string} The localized, human-friendly timestamp (empty when absent).
 */
export const timeSinceEpoch = (epoch) => {
    if (epoch === undefined || epoch === null) {
        return '';
    }

    const ms = epoch * 1000;
    const diffSec = Math.round((ms - Date.now()) / 1000); // negative = in the past

    if (Math.abs(diffSec) < 60) {
        return RELATIVE_TIME_FMT.format(diffSec, 'second');
    }
    if (Math.abs(diffSec) < 3600) {
        return RELATIVE_TIME_FMT.format(Math.round(diffSec / 60), 'minute');
    }

    return ABSOLUTE_TIME_FMT.format(new Date(ms));
};

/**
 * Formats an epoch-seconds timestamp as an absolute local date/time, in the viewer's
 * own locale -- no relative fallback. For log-style listings where every row needs a
 * real date/time, not "3 minutes ago".
 *
 * @param {number} epoch - Unix time in seconds.
 * @return {string} The localized date/time (empty when absent).
 */
export const formatEpochDateTime = (epoch) => {
    if (epoch === undefined || epoch === null) {
        return '';
    }

    return ABSOLUTE_TIME_FMT.format(new Date(epoch * 1000));
};

/**
 * Formats a calendar date string (e.g. "2026-06-04") in the viewer's own locale. Parsed
 * as a local date so the day never shifts with the viewer's timezone offset.
 *
 * @param {string} dateString - ISO calendar date (YYYY-MM-DD).
 * @return {string} The localized date; the input unchanged when unparseable, empty when absent.
 */
export const formatCalendarDate = (dateString) => {
    if (!dateString) {
        return '';
    }

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return DATE_ONLY_FMT.format(date);
};
