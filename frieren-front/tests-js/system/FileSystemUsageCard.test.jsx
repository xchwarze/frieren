/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { render, screen, within } from '@testing-library/react';

import FileSystemUsageCard from '@src/features/system/components/FileSystemUsageCard/index.jsx';
import useGetFileSystemUsage from '@src/features/system/hooks/useGetFileSystemUsage.js';

vi.mock('@src/features/system/hooks/useGetFileSystemUsage.js', () => ({ default: vi.fn() }));

const mount = (overrides) => {
    useGetFileSystemUsage.mockReturnValue({
        data: undefined,
        isSuccess: false,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
        ...overrides,
    });

    return render(<FileSystemUsageCard />);
};

describe('FileSystemUsageCard', () => {
    it('shows a skeleton instead of reading .map off an undefined query result while loading', () => {
        mount({ isLoading: true, data: undefined });

        expect(screen.queryByText('No file systems found.')).not.toBeInTheDocument();
        expect(screen.queryByText('/dev/root')).not.toBeInTheDocument();
    });

    it('renders one row per mounted filesystem with all reported columns', () => {
        mount({
            isSuccess: true,
            data: [
                { filesystem: '/dev/root', type: 'ext4', size: '1.9G', used: '400M', available: '1.4G', usePercent: '23%', mountedOn: '/' },
            ],
        });

        const row = screen.getByText('/dev/root').closest('tr');
        const cells = within(row).getAllByRole('cell');
        expect(cells.map((cell) => cell.textContent)).toEqual(['/dev/root', 'ext4', '1.9G', '400M', '1.4G', '23%', '/']);
        expect(screen.queryByText('No file systems found.')).not.toBeInTheDocument();
    });

    it('shows an explicit empty-state row rather than a blank table when there are no filesystems', () => {
        mount({ isSuccess: true, data: [] });

        expect(screen.getByText('No file systems found.')).toBeInTheDocument();
    });

    it('renders no table content, without crashing, while the query is idle/errored', () => {
        mount({ isSuccess: false, isLoading: false, data: undefined });

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});
