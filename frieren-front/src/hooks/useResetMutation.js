/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai'
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';

import authAtom from '@src/atoms/authAtom.js';
import { fetchPost } from '@src/services/fetchService.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';

/**
 * Restart the real hardware.
 *
 * @return {Function} The mutation function
 */
const useResetMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useSetAtom(authAtom)
  const [, setLocation] = useLocation();

  return useAuthenticatedMutation({
    mutationFn: () => fetchPost({
      module: 'header',
      action: 'resetHardware',
    }),
    onSuccess: () => {
      setAuth(false);
      setLocation('/');
      queryClient.clear();
      toast.success('Logoff user');
    },
    onError: () => {
      toast.error('Logoff failed');
    }
  });
};

export default useResetMutation;
