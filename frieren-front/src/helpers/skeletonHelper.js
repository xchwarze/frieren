/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Reads a Bootstrap CSS variable from the document root as a resolved color string.
 *
 * @param {string} varName - CSS variable name (e.g., '--bs-secondary-bg').
 * @return {string} The resolved color value.
 */
export const getBootstrapColor = (varName) =>
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

/**
 * Returns background and foreground colors for content-loader skeletons,
 * derived from Bootstrap's current theme CSS variables.
 *
 * @return {{ background: string, foreground: string }}
 */
export const getSkeletonColors = () => ({
    background: getBootstrapColor('--bs-secondary-bg'),
    foreground: getBootstrapColor('--bs-tertiary-bg'),
});
