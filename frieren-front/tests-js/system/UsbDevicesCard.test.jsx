/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { render, screen, within } from '@testing-library/react';

import UsbDevicesCard from '@src/features/system/components/UsbDevicesCard/index.jsx';
import useGetUsbDevices from '@src/features/system/hooks/useGetUsbDevices.js';

vi.mock('@src/features/system/hooks/useGetUsbDevices.js', () => ({ default: vi.fn() }));

const mount = (overrides) => {
    useGetUsbDevices.mockReturnValue({
        data: undefined,
        isSuccess: false,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
        ...overrides,
    });

    return render(<UsbDevicesCard />);
};

describe('UsbDevicesCard', () => {
    it('shows a skeleton instead of reading .map off an undefined query result while loading', () => {
        mount({ isLoading: true, data: undefined });

        expect(screen.queryByText('No USB devices detected.')).not.toBeInTheDocument();
        expect(screen.queryByText('Flash Drive')).not.toBeInTheDocument();
    });

    it('renders one row per USB device with all reported columns', () => {
        mount({
            isSuccess: true,
            data: [{ bus: '001', device: '002', id: '0951:1666', name: 'Flash Drive' }],
        });

        const row = screen.getByText('Flash Drive').closest('tr');
        const cells = within(row).getAllByRole('cell');
        expect(cells.map((cell) => cell.textContent)).toEqual(['001', '002', '0951:1666', 'Flash Drive']);
        expect(screen.queryByText('No USB devices detected.')).not.toBeInTheDocument();
    });

    it('shows an explicit empty-state row rather than a blank table when no devices are connected', () => {
        mount({ isSuccess: true, data: [] });

        expect(screen.getByText('No USB devices detected.')).toBeInTheDocument();
    });

    it('renders no table content, without crashing, while the query is idle/errored', () => {
        mount({ isSuccess: false, isLoading: false, data: undefined });

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});
