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
