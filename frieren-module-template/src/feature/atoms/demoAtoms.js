/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const demoCounterAtom = atom(0);
export const demoPersistedAtom = atomWithStorage('demo-persisted-value', '');
