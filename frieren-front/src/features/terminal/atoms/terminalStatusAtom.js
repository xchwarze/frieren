import { atomWithStorage } from 'jotai/utils';

const terminalStatusAtom = atomWithStorage('terminal-status', false);

export default terminalStatusAtom;
