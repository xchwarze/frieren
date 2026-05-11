/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atom } from 'jotai';

const dependencyInstallStatusAtom = atom({
    isRunning: false,
    logContent: '',
    hasDependencies: false,
});

// this atom is a wrapper around dependencyInstallStatusAtom
const setIsRunningAtom = atom(
    (get) => get(dependencyInstallStatusAtom).isRunning,
    (get, set, newState) => {
        const state = get(dependencyInstallStatusAtom);
        set(dependencyInstallStatusAtom, { ...state, isRunning: newState });
    }
);

export { dependencyInstallStatusAtom, setIsRunningAtom };
