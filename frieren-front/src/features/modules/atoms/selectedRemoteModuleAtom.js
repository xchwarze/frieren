/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { atom } from 'jotai'

const installModuleAtom = atom(false);

// this atom is a wrapper around installModuleAtom
const setModuleDestinationAtom = atom(
    null,
    (get, set, newState) => {
        const state = get(installModuleAtom);
        set(installModuleAtom, { ...state, destination: newState });
    }
);

export { installModuleAtom, setModuleDestinationAtom };
