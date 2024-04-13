/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useSetAtom } from 'jotai';

import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Returns a mutation hook for opening a terminal, which sets the terminal status on success.
 *
 * @return {Function} The mutation hook.
 */
const useOpenTerminalMutation = () => {
  const setTerminalStatus = useSetAtom(terminalStatusAtom);

  return useAuthenticatedMutation({
    mutationFn: () => (
      fetchPost({
        module: 'terminal',
        action: 'startTerminal',
      })
    ),
    onSuccess: () => {
      setTerminalStatus(true);
    },
  });
};

export default useOpenTerminalMutation;
