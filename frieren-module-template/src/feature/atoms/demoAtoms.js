/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const demoCounterAtom = atom(0);
export const demoPersistedAtom = atomWithStorage('demo-persisted-value', '');
