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
