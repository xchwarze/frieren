import { atomWithStorage } from 'jotai/utils';

const authAtom = atomWithStorage('user-logged', null);

export default authAtom;
