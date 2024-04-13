import { atomWithStorage } from 'jotai/utils';

const sidebarStatusAtom = atomWithStorage('sidebar-status', false);

export default sidebarStatusAtom;
