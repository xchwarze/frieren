/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

// Panel version, injected from package.json by vite.config.js (define VITE_APP_VERSION).
const PANEL_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';

/**
 * Parses an "x.y.z" string into a [major, minor, patch] number tuple,
 * or null when it isn't a plain numeric semver.
 *
 * @param {String} version - The version string.
 * @return {Number[]|null} The parsed parts, or null.
 */
const parseVersion = (version) => {
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(String(version ?? '').trim());
    if (!match) {
        return null;
    }
    return [Number(match[1]), Number(match[2]), Number(match[3])];
};

/**
 * Compares two semver strings. Returns 1 if a > b, -1 if a < b, 0 if equal.
 *
 * @param {String} a - First version.
 * @param {String} b - Second version.
 * @return {Number} The comparison result.
 */
export const compareVersions = (a, b) => {
    const left = parseVersion(a) ?? [0, 0, 0];
    const right = parseVersion(b) ?? [0, 0, 0];
    for (let i = 0; i < 3; i += 1) {
        if (left[i] !== right[i]) {
            return left[i] > right[i] ? 1 : -1;
        }
    }
    return 0;
};

/**
 * The panel version this build is running.
 *
 * @return {String} The panel version (e.g. "1.4.1") or "dev".
 */
export const getPanelVersion = () => PANEL_VERSION;

/**
 * Whether the running panel satisfies a module's minimum required version.
 * Unknown/empty requirement or an unparseable panel version is treated as
 * sufficient (never block a dev build on an unknown version).
 *
 * @param {String} [minPanelVersion] - The module's minPanelVersion.
 * @return {Boolean} True if the panel is new enough.
 */
export const isPanelVersionSufficient = (minPanelVersion) => {
    if (!minPanelVersion || parseVersion(minPanelVersion) === null) {
        return true;
    }
    if (parseVersion(PANEL_VERSION) === null) {
        return true;
    }
    return compareVersions(PANEL_VERSION, minPanelVersion) >= 0;
};
