/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithReset } from 'jotai/utils';

const collapseStatusAtom = atomWithReset(true);

export default collapseStatusAtom;
