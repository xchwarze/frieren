/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * fetchPost resolves (never throws) on a bad-credentials response — the backend reports
 * failure in the payload, not via HTTP status. So the hook's onSuccess must gate the
 * auth/redirect on `data.success` itself; a regression that redirects unconditionally on
 * any resolved promise would land a rejected login on the dashboard with no session.
 */
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useUserLoginMutation from '@src/features/login/hooks/useUserLogin.js';
import { fetchPost } from '@src/services/fetchService.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));

const setAuth = vi.fn();
const setLocation = vi.fn();

vi.mock('jotai', () => ({ useSetAtom: () => setAuth }));
vi.mock('wouter', () => ({ useLocation: () => [undefined, setLocation] }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

const renderLoginMutation = () => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    return renderHook(() => useUserLoginMutation(), {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
};

describe('useUserLoginMutation', () => {
    beforeEach(() => {
        fetchPost.mockReset();
        setAuth.mockReset();
        setLocation.mockReset();
        toast.error.mockReset();
    });

    it('sends credentials plus the browser datetime/timezone to the login action', async () => {
        fetchPost.mockResolvedValue({ success: true });
        const { result } = renderLoginMutation();

        await act(async () => {
            await result.current.mutateAsync({ username: 'admin', password: 'secret' });
        });

        expect(fetchPost).toHaveBeenCalledWith(expect.objectContaining({
            module: 'login',
            action: 'login',
            username: 'admin',
            password: 'secret',
            datetime: expect.any(Number),
            timezone: expect.stringMatching(/^GMT[+-]\d+$/),
        }));
    });

    it('authenticates and redirects to the dashboard when the backend reports success', async () => {
        fetchPost.mockResolvedValue({ success: true });
        const { result } = renderLoginMutation();

        await act(async () => {
            await result.current.mutateAsync({ username: 'admin', password: 'secret' });
        });

        expect(setAuth).toHaveBeenCalledWith(true);
        expect(setLocation).toHaveBeenCalledWith('/dashboard');
    });

    it('does not authenticate or redirect on a resolved but unsuccessful login', async () => {
        fetchPost.mockResolvedValue({ success: false });
        const { result } = renderLoginMutation();

        await act(async () => {
            await result.current.mutateAsync({ username: 'admin', password: 'wrong' });
        });

        expect(setAuth).not.toHaveBeenCalled();
        expect(setLocation).not.toHaveBeenCalled();
    });

    it('shows an error toast, and does not authenticate, when the request itself fails', async () => {
        fetchPost.mockRejectedValue(new Error('network down'));
        const { result } = renderLoginMutation();

        await act(async () => {
            await expect(result.current.mutateAsync({ username: 'admin', password: 'secret' })).rejects.toThrow('network down');
        });

        expect(toast.error).toHaveBeenCalledWith('Login failed');
        expect(setAuth).not.toHaveBeenCalled();
    });
});
