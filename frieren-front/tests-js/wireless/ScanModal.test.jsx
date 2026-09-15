/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `Loading` reads its spinner asset off window.Frieren.loadingImage, normally set by
 * umdSupport.js at app boot; the no-results-yet loading branch here renders it directly, so a
 * stub is provided.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import ScanModal from '@src/features/wireless/components/ScanModal/index.jsx';
import useScanRadio from '@src/features/wireless/hooks/useScanRadio.js';

vi.mock('@src/features/wireless/hooks/useScanRadio.js', () => ({ default: vi.fn() }));

window.Frieren = { loadingImage: 'test-loading.png' };

const footerSummary = (_, element) => (
    element.tagName.toLowerCase() === 'small' && element.className.includes('me-auto')
);

describe('ScanModal', () => {
    beforeEach(() => {
        useScanRadio.mockReset();
    });

    it('starts an auto-refreshing scan of the given radio as soon as it is shown', () => {
        useScanRadio.mockReturnValue({ data: [], isFetching: false });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(useScanRadio).toHaveBeenCalledWith('radio0', true);
    });

    it('stops polling on Pause and resumes it on Resume, without ever closing the modal', () => {
        useScanRadio.mockReturnValue({ data: [], isFetching: false });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
        expect(useScanRadio).toHaveBeenLastCalledWith('radio0', false);

        fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
        expect(useScanRadio).toHaveBeenLastCalledWith('radio0', true);
    });

    it('merges new poll results into the running list, keeping the strongest reading per BSSID', () => {
        useScanRadio.mockReturnValue({
            data: [{ bssid: 'aa', ssid: 'FirstSeen', signal: -40, channel: 1, security: 'WPA2' }],
            isFetching: false,
        });
        const { rerender } = render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);
        expect(screen.getByText('-40')).toBeInTheDocument();

        useScanRadio.mockReturnValue({
            data: [
                { bssid: 'aa', ssid: 'FirstSeen', signal: -80, channel: 1, security: 'WPA2' }, // weaker: ignored
                { bssid: 'bb', ssid: 'SecondSeen', signal: -30, channel: 6, security: 'Open' },
            ],
            isFetching: false,
        });
        rerender(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.getByText('-40')).toBeInTheDocument(); // kept, not overwritten by the weaker -80
        expect(screen.queryByText('-80')).not.toBeInTheDocument();
        expect(screen.getByText('-30')).toBeInTheDocument();
    });

    it('sorts by channel ascending when the Ch header is clicked', () => {
        useScanRadio.mockReturnValue({
            data: [
                { bssid: 'aa', ssid: 'Charlie', signal: -50, channel: 11 },
                { bssid: 'bb', ssid: 'Alpha', signal: -60, channel: 1 },
                { bssid: 'cc', ssid: 'Bravo', signal: -40, channel: 6 },
            ],
            isFetching: false,
        });
        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Ch' }));

        const rows = screen.getAllByRole('row').slice(1);
        expect(rows.map((row) => row.textContent)).toEqual([
            expect.stringContaining('Alpha'),
            expect.stringContaining('Bravo'),
            expect.stringContaining('Charlie'),
        ]);
    });

    it('sorts alphabetically by SSID when the SSID header is clicked', () => {
        useScanRadio.mockReturnValue({
            data: [
                { bssid: 'aa', ssid: 'Charlie', signal: -50, channel: 11 },
                { bssid: 'bb', ssid: 'Alpha', signal: -60, channel: 1 },
                { bssid: 'cc', ssid: 'Bravo', signal: -40, channel: 6 },
            ],
            isFetching: false,
        });
        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'SSID' }));

        const rows = screen.getAllByRole('row').slice(1);
        expect(rows.map((row) => row.textContent)).toEqual([
            expect.stringContaining('Alpha'),
            expect.stringContaining('Bravo'),
            expect.stringContaining('Charlie'),
        ]);
    });

    it('labels a network with no broadcast SSID as "(hidden)"', () => {
        useScanRadio.mockReturnValue({
            data: [{ bssid: 'aa', ssid: '', signal: -50, channel: 1 }],
            isFetching: false,
        });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.getByText('(hidden)')).toBeInTheDocument();
    });

    it('reports the picked network back to the caller when Connect is clicked', () => {
        const onConnect = vi.fn();
        const network = { bssid: 'aa', ssid: 'MyNet', signal: -50, channel: 6, security: 'WPA2' };
        useScanRadio.mockReturnValue({ data: [network], isFetching: false });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={onConnect} />);
        fireEvent.click(screen.getByRole('button', { name: 'Connect' }));

        expect(onConnect).toHaveBeenCalledWith(network);
    });

    it('shows a loading indicator, not the empty-state message, before the first scan result arrives', () => {
        useScanRadio.mockReturnValue({ data: undefined, isFetching: true });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.queryByText('No networks found.')).not.toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows an empty-state message once scanning settles on zero results', () => {
        useScanRadio.mockReturnValue({ data: [], isFetching: false });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.getByText('No networks found.')).toBeInTheDocument();
    });

    it('clears accumulated results when closed, and does not resurrect them just by reopening', () => {
        useScanRadio.mockReturnValue({
            data: [{ bssid: 'aa', ssid: 'StaleNet', signal: -40, channel: 1 }],
            isFetching: false,
        });
        const { rerender } = render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);
        expect(screen.getByText('StaleNet')).toBeInTheDocument();

        rerender(<ScanModal show={false} radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);
        rerender(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.queryByText('StaleNet')).not.toBeInTheDocument();
        expect(screen.getByText('No networks found.')).toBeInTheDocument();
    });

    it('closes via the Close button', () => {
        const onHide = vi.fn();
        useScanRadio.mockReturnValue({ data: [], isFetching: false });

        render(<ScanModal show radioName={'radio0'} onHide={onHide} onConnect={vi.fn()} />);
        // The modal's header also has an unrelated close-X button sharing the "Close" accessible
        // name; only the footer button has visible text, so target that one specifically.
        fireEvent.click(screen.getByText('Close').closest('button'));

        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('shows a pluralized found-network count with a scanning indicator while still polling', () => {
        useScanRadio.mockReturnValue({
            data: [{ bssid: 'aa', ssid: 'A', signal: -40, channel: 1 }],
            isFetching: true,
        });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.getByText(footerSummary).textContent).toBe('1 network found · scanning…');
    });

    it('pluralizes the count and drops the scanning indicator once polling stops', () => {
        useScanRadio.mockReturnValue({
            data: [
                { bssid: 'aa', ssid: 'A', signal: -40, channel: 1 },
                { bssid: 'bb', ssid: 'B', signal: -30, channel: 6 },
            ],
            isFetching: false,
        });

        render(<ScanModal show radioName={'radio0'} onHide={vi.fn()} onConnect={vi.fn()} />);

        expect(screen.getByText(footerSummary).textContent).toBe('2 networks found');
    });
});
