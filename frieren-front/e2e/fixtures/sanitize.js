/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Scrubs network-/owner-identifying data from recorded API responses so the
 * committed mock fixture never carries real device data: MAC addresses, IP
 * addresses, hostnames, SSIDs and Wi-Fi keys.
 *
 * Deterministic — the same real value always maps to the same fake value, so a
 * MAC/IP/SSID stays consistent across every endpoint in the fixture (the UI and
 * tests still see internally-consistent data).
 */

const MAC_RE = /([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/g;
const IPV4_RE = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

// Structural / non-identifying addresses — left as-is (loopback, any, netmasks).
const IP_KEEP = new Set([
    '0.0.0.0',
    '127.0.0.1',
    '127.0.0.0',
    '255.255.255.255',
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makeMacMapper = () => {
    const map = new Map();
    return (mac) => {
        const key = mac.toLowerCase();
        if (!map.has(key)) {
            const suffix = (map.size + 1).toString(16).padStart(2, '0');
            // Locally-administered, obviously-synthetic OUI.
            map.set(key, `02:00:00:00:00:${suffix}`);
        }

        return map.get(key);
    };
};

const makeIpMapper = () => {
    const map = new Map();
    return (ip) => {
        // Keep loopback/any and any subnet mask (255.x.x.x) untouched.
        if (IP_KEEP.has(ip) || ip.startsWith('255.')) {
            return ip;
        }
        if (!map.has(ip)) {
            // RFC 5737 TEST-NET-1 documentation range.
            map.set(ip, `192.0.2.${Math.min(map.size + 1, 254)}`);
        }

        return map.get(ip);
    };
};

// Actions whose arrays drive navigation/structure and must stay intact.
const TRIM_EXEMPT = new Set(['getModuleList']);

const capArrays = (node, max) => {
    if (Array.isArray(node)) {
        node.length = Math.min(node.length, max);
        node.forEach((item) => capArrays(item, max));

        return;
    }
    if (node && typeof node === 'object') {
        Object.values(node).forEach((value) => capArrays(value, max));
    }
};

/**
 * Keeps the fixture small and readable: caps long arrays to a few representative
 * rows and clips multi-line command output. Mock tests assert shape/presence, so
 * a handful of rows is enough. `getModuleList` is left intact (drives the nav).
 *
 * @param {Object} data - The recorded responses object.
 * @param {Number} [maxItems=3] - Max rows kept per array.
 * @param {Number} [maxOutputLines=4] - Max lines kept for command output strings.
 * @return {Object} A trimmed deep copy.
 */
export function trimRecorded(data, maxItems = 3, maxOutputLines = 4) {
    const clone = JSON.parse(JSON.stringify(data));

    for (const actions of Object.values(clone)) {
        for (const [action, value] of Object.entries(actions)) {
            if (TRIM_EXEMPT.has(action)) {
                continue;
            }
            capArrays(value, maxItems);
            if (value && typeof value === 'object' && typeof value.output === 'string') {
                value.output = value.output.split('\n').slice(0, maxOutputLines).join('\n');
            }
        }
    }

    return clone;
}

/**
 * @param {Object} data - The recorded responses object.
 * @return {Object} A sanitized deep copy safe to commit.
 */
export function sanitizeRecorded(data) {
    const clone = JSON.parse(JSON.stringify(data));
    const literals = new Map();

    const addLiteral = (real, fake) => {
        if (typeof real === 'string' && real.trim() !== '' && !literals.has(real)) {
            literals.set(real, fake);
        }
    };

    // Hostnames (device + DHCP/static clients).
    addLiteral(clone?.dashboard?.getSystemResume?.hostname, 'frieren');
    addLiteral(clone?.settings?.getSectionData?.hostname, 'frieren');
    (clone?.network?.getDhcpLeases?.leases ?? []).forEach((lease, index) => {
        addLiteral(lease?.hostname, `client-${index + 1}`);
    });
    (clone?.network?.getStaticLeases?.leases ?? []).forEach((lease, index) => {
        addLiteral(lease?.name, `static-${index + 1}`);
        addLiteral(lease?.hostname, `static-${index + 1}`);
    });

    // SSIDs (overview + interface status + raw UCI config).
    let ssidCount = 0;
    const nextSsid = () => {
        ssidCount += 1;

        return ssidCount === 1 ? 'ExampleNet' : `ExampleNet-${ssidCount}`;
    };
    const overview = clone?.wireless?.getWirelessOverview ?? {};
    for (const radio of Object.values(overview)) {
        (radio?.interfaces ?? []).forEach((iface) => addLiteral(iface?.ssid, nextSsid()));
    }
    addLiteral(clone?.wireless?.getInterfaceStatus?.ssid, nextSsid());

    const rawContent = clone?.wireless?.getRawWirelessConfig?.content;
    if (typeof rawContent === 'string') {
        for (const match of rawContent.matchAll(/option ssid '([^']*)'/g)) {
            addLiteral(match[1], nextSsid());
        }
        // Every Wi-Fi key/passphrase becomes the same placeholder.
        for (const match of rawContent.matchAll(/option key '([^']*)'/g)) {
            addLiteral(match[1], 'ExamplePassphrase');
        }
    }

    let json = JSON.stringify(clone);

    // Replace longest literals first so a short value can't clobber a longer one.
    const sortedLiterals = [...literals.entries()].sort((a, b) => b[0].length - a[0].length);
    for (const [real, fake] of sortedLiterals) {
        const pattern = /^[A-Za-z0-9_-]+$/.test(real)
            ? new RegExp(`\\b${escapeRegExp(real)}\\b`, 'g')
            : new RegExp(escapeRegExp(real), 'g');
        json = json.replace(pattern, fake);
    }

    const mapMac = makeMacMapper();
    json = json.replace(MAC_RE, (mac) => mapMac(mac));

    const mapIp = makeIpMapper();
    json = json.replace(IPV4_RE, (ip) => mapIp(ip));

    return JSON.parse(json);
}
