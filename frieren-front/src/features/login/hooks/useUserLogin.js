/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai'
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';

import authAtom from '@src/atoms/authAtom.js';
import { fetchPost } from '@src/services/fetchService.js';
import { retrieveBrowserDatetime } from '@src/helpers/browserDatetime.js';

/**
 * Returns a mutation hook for user login.
 *
 * @return {Function} The mutation hook.
 */
const useUserLoginMutation = () => {
  const setAuth = useSetAtom(authAtom)
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ username, password }) => {
      return fetchPost({
        module: 'login',
        action: 'login',
        username,
        password,
        ...retrieveBrowserDatetime(),
      })
    },
    onSuccess: (data) => {
      if (data?.success) {
        setAuth(true);
        setLocation('/dashboard');
      }
    },
    onError: () => {
      toast.error('Login failed');
    }
  });
}

export default useUserLoginMutation;
