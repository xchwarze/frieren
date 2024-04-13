/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { atomWithStorage } from 'jotai/utils';

const terminalStatusAtom = atomWithStorage('terminal-status', false);

export default terminalStatusAtom;
