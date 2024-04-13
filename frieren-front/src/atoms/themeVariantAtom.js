import { atomWithStorage } from 'jotai/utils';

const userAtom = atomWithStorage('theme-variant', 'auto');

export default userAtom;
