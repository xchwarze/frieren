/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const panelHeightAtom = atomWithStorage(
    'terminal-panel-height',
    200,
    createJSONStorage(() => sessionStorage),
);

export default panelHeightAtom;
