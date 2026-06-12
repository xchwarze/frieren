/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
// The theme color maps live in terminal-core so modules (via window.Frieren.TerminalCore)
// render the same operator-selected scheme. This re-export keeps the panel imports stable.
export { TERMINAL_THEMES } from '@frieren/terminal-core';

/**
 * Options for the terminal theme select dropdown (panel settings UI).
 */
export const TERMINAL_THEME_OPTIONS = [
    { value: 'default', label: 'Default' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'nord', label: 'Nord' },
    { value: 'solarizedDark', label: 'Solarized Dark' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'gruvbox', label: 'Gruvbox' },
    { value: 'catppuccinMocha', label: 'Catppuccin Mocha' },
    { value: 'tokyoNight', label: 'Tokyo Night' },
];
