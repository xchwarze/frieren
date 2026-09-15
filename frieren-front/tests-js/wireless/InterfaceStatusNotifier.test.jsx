/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `InterfaceStatusNotifier` is a renderless polling watcher: it toasts success/failure and
 * invalidates the overview cache exactly once, driven entirely by the mocked
 * `useGetInterfaceStatus` result and a 15s timeout. `toast` is mocked at the module boundary
 * so we can assert on message content (including the JSX success message for a station IP)
 * without a real ToastContainer, and `useQueryClient` runs for real inside a QueryClientProvider
 * so `invalidateQueries` can be spied on directly.
 */
import { act, render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import InterfaceStatusNotifier from '@src/features/wireless/components/WirelessOverviewCard/InterfaceStatusNotifier.jsx';
import useGetInterfaceStatus from '@src/features/wireless/hooks/useGetInterfaceStatus.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/features/wireless/hooks/useGetInterfaceStatus.js', () => ({ default: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderNotifier = (section, onDone, queryClient) => render(
    <QueryClientProvider client={queryClient}>
        <InterfaceStatusNotifier section={section} onDone={onDone} />
    </QueryClientProvider>
);

describe('InterfaceStatusNotifier', () => {
    let queryClient;
    let invalidateQueries;

    beforeEach(() => {
        toast.success.mockReset();
        toast.error.mockReset();
        queryClient = new QueryClient();
        invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not toast or finish while the interface is still connecting', () => {
        useGetInterfaceStatus.mockReturnValue({ data: { state: 'RUNNING', mode: 'sta' } });
        const onDone = vi.fn();

        renderNotifier('wifinet0', onDone, queryClient);

        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
        expect(onDone).not.toHaveBeenCalled();
    });

    it('shows the IP in the success toast for a completed station connection, invalidates the overview, and finishes', () => {
        useGetInterfaceStatus.mockReturnValue({ data: { state: 'COMPLETED', mode: 'sta', ip: '10.0.0.5' } });
        const onDone = vi.fn();

        renderNotifier('wifinet0', onDone, queryClient);

        expect(toast.success).toHaveBeenCalledTimes(1);
        // The success message is JSX (`<>{message}<br />IP: {data.ip}</>`), so match on the
        // rendered container's text content rather than a single text node.
        const { container } = render(toast.success.mock.calls[0][0]);
        expect(container).toHaveTextContent('Station connected successfully');
        expect(container).toHaveTextContent(/IP: 10\.0\.0\.5/);

        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('shows a plain success toast, with no IP line, for an AP that comes up (default mode)', () => {
        useGetInterfaceStatus.mockReturnValue({ data: { state: 'UP' } });
        const onDone = vi.fn();

        renderNotifier('wifinet1', onDone, queryClient);

        expect(toast.success).toHaveBeenCalledWith('Access point started successfully');
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('does not toast again on a re-render after the check has already resolved', () => {
        const data = { state: 'UP', mode: 'ap' };
        useGetInterfaceStatus.mockReturnValue({ data });
        const onDone = vi.fn();

        const { rerender } = renderNotifier('wifinet1', onDone, queryClient);
        rerender(
            <QueryClientProvider client={queryClient}>
                <InterfaceStatusNotifier section={'wifinet1'} onDone={onDone} />
            </QueryClientProvider>
        );

        expect(toast.success).toHaveBeenCalledTimes(1);
        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('shows a mode-specific failure toast and finishes once the 15s connection timeout elapses', () => {
        vi.useFakeTimers();
        useGetInterfaceStatus.mockReturnValue({ data: { state: 'RUNNING', mode: 'monitor' } });
        const onDone = vi.fn();

        renderNotifier('wifinet2', onDone, queryClient);
        expect(toast.error).not.toHaveBeenCalled();

        act(() => { vi.advanceTimersByTime(15000); });

        expect(toast.error).toHaveBeenCalledWith('Monitor interface failed to start.');
        expect(toast.success).not.toHaveBeenCalled();
        expect(onDone).toHaveBeenCalledTimes(1);
    });
});
