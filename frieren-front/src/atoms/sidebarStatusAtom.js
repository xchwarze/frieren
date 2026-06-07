/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithStorage } from 'jotai/utils';

// getOnInit reads localStorage synchronously at init, so the first paint already
// reflects the stored collapsed state — no width animation flashing on load.
const sidebarStatusAtom = atomWithStorage('sidebar-status', false, undefined, { getOnInit: true });

export default sidebarStatusAtom;
