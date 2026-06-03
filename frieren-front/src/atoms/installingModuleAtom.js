/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithStorage } from 'jotai/utils';

// Name of the module whose dependency installation is currently running.
// Persisted so the "installing" state survives navigation and reloads.
const installingModuleAtom = atomWithStorage('installing-module', null);

export default installingModuleAtom;
