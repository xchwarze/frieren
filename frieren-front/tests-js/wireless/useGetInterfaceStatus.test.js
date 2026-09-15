/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The only real logic this hook owns is the poll-until-terminal-state `refetchInterval`
 * callback and the `enabled`/`staleTime`/`gcTime` wiring around it — `useAuthenticatedQuery`
 * is mocked at the module boundary so that logic is exercised directly, without waiting on
 * real timers or react-query's own scheduling internals.
 */
import { renderHook } from '@testing-library/react';

import useGetInterfaceStatus from '@src/features/wireless/hooks/useGetInterfaceStatus.js';
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_INTERFACE_STATUS } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/hooks/useAuthenticatedQuery.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));

describe('useGetInterfaceStatus', () => {
    let capturedOptions;

    beforeEach(() => {
        fetchPost.mockReset();
        useAuthenticatedQuery.mockImplementation((options) => {
            capturedOptions = options;
            return {};
        });
    });

    it('queries getInterfaceStatus for the given section', () => {
        renderHook(() => useGetInterfaceStatus('wlan0'));

        expect(capturedOptions.queryKey).toEqual([WIRELESS_GET_INTERFACE_STATUS, 'wlan0']);
        capturedOptions.queryFn();
        expect(fetchPost).toHaveBeenCalledWith({
            module: 'wireless',
            action: 'getInterfaceStatus',
            section: 'wlan0',
        });
    });

    it('is disabled without a section', () => {
        renderHook(() => useGetInterfaceStatus(null));

        expect(capturedOptions.enabled).toBe(false);
    });

    it('is enabled once a section is given', () => {
        renderHook(() => useGetInterfaceStatus('wlan0'));

        expect(capturedOptions.enabled).toBe(true);
    });

    it.each(['COMPLETED', 'UP'])('stops polling once the interface state reaches %s', (state) => {
        renderHook(() => useGetInterfaceStatus('wlan0'));

        expect(capturedOptions.refetchInterval({ state: { data: { state } } })).toBe(false);
    });

    it.each([undefined, 'PENDING', 'DOWN'])('keeps polling every 1.5s while the state is %s', (state) => {
        renderHook(() => useGetInterfaceStatus('wlan0'));

        expect(capturedOptions.refetchInterval({ state: { data: { state } } })).toBe(1500);
    });

    it('never treats a stale status as fresh between polls', () => {
        renderHook(() => useGetInterfaceStatus('wlan0'));

        expect(capturedOptions.staleTime).toBe(0);
        expect(capturedOptions.gcTime).toBe(0);
    });
});
