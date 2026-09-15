/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

export const MODE_OPTIONS = [
    { value: 'ap', label: 'Access Point' },
    { value: 'sta', label: 'Station' },
    { value: 'monitor', label: 'Monitor' },
];

// mac80211/hostapd-defined enums, fixed across every driver — unlike channels/txpower/country,
// these are not hardware-reported capabilities, so they are safe to hardcode here.
export const CELL_DENSITY_OPTIONS = [
    { value: '0', label: 'Disabled (default)' },
    { value: '1', label: 'Normal' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Very High' },
];

export const IEEE80211W_OPTIONS = [
    { value: '0', label: 'Disabled' },
    { value: '1', label: 'Optional' },
    { value: '2', label: 'Required' },
];
