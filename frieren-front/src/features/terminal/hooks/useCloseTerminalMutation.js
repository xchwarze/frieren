/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Generates a mutation function that stops the terminal, resets status values, and updates the terminal status.
 *
 * @return {Function} The mutation hook.
 */
const useCloseTerminalMutation = () => {
  const setTerminalStatus = useSetAtom(terminalStatusAtom);
  const collapseStatusReset = useResetAtom(collapseStatusAtom);
  const socketStatusReset = useResetAtom(socketStatusAtom);

  return useAuthenticatedMutation({
    mutationFn: () => (
      fetchPost({
        module: 'terminal',
        action: 'stopTerminal',
      })
    ),
    onSuccess: () => {
      setTerminalStatus(false);
      collapseStatusReset();
      socketStatusReset();
    },
  });
};

export default useCloseTerminalMutation;
