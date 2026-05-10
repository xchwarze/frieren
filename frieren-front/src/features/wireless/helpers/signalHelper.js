/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Returns a Bootstrap variant name based on signal strength in dBm.
 *
 * @param {number|string} signal - Signal strength value (dBm).
 * @return {string} Bootstrap variant: 'success', 'warning', 'danger', or 'secondary'.
 */
export const getSignalVariant = (signal) => {
    const value = parseInt(signal, 10);
    if (isNaN(value)) return 'secondary';
    if (value >= -60) return 'success';
    if (value >= -75) return 'warning';
    return 'danger';
};
