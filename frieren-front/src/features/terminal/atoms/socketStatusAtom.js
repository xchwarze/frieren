import { atomWithReset } from 'jotai/utils';

const socketStatusAtom = atomWithReset(false);

export default socketStatusAtom;
