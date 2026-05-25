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

export const NETWORK_OPTIONS = [
    { value: 'lan', label: 'LAN' },
    { value: 'wwan', label: 'WWAN' },
    { value: 'guest', label: 'Guest' },
];

export const ENCRYPTION_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'psk2+ccmp', label: 'WPA2-PSK' },
    { value: 'sae', label: 'WPA3-SAE' },
    { value: 'psk-mixed+ccmp', label: 'WPA/WPA2 Mixed' },
];
