/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithStorage } from 'jotai/utils';

// Defaults here are only used on first-ever load before startTerminal seeds from UCI config
const terminalSettingsAtom = atomWithStorage('terminal-settings', {
    terminalTheme: 'default',
    fontSize: 13,
    cursorStyle: 'block',
    cursorBlink: false,
});

export default terminalSettingsAtom;
