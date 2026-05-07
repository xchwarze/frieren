/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Parses the raw opkg list output into an array of package objects.
 *
 * @param {string} raw - The raw opkg list/list-installed output.
 * @return {Array} An array of {name, version, description} objects.
 */
const parsePackageList = (raw) => {
    if (!raw) {
        return [];
    }

    return raw.split('\n').reduce((acc, line) => {
        const parts = line.split(' - ');
        if (parts.length >= 2) {
            acc.push({
                name: parts[0].trim(),
                version: parts[1].trim(),
                description: parts.length >= 3 ? parts.slice(2).join(' - ').trim() : '',
            });
        }
        return acc;
    }, []);
};

export default parsePackageList;
