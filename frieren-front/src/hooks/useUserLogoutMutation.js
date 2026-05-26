/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
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
 * Returns a mutation function for user logout.
 *
 * @return {Function} The mutation function for user logout
 */
const useUserLogoutMutation = () => {
  const queryClient = useQueryClient();
  const setAuth = useSetAtom(authAtom)
  const [, setLocation] = useLocation();

  return useAuthenticatedMutation({
    mutationFn: () => fetchPost({
      module: 'login',
      action: 'logout',
    }),
    onSuccess: () => {
      setAuth(false);
      setLocation('/');
      queryClient.clear();
      toast.success('Logged out');
    },
    onError: () => {
      toast.error('Logout failed');
    }
  });
};

export default useUserLogoutMutation;
