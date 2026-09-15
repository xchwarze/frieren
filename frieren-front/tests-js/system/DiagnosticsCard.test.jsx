/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen } from '@testing-library/react';

import DiagnosticsCard from '@src/features/system/components/DiagnosticsCard/index.jsx';
import useDiagnosticsStatus from '@src/features/system/hooks/useDiagnosticsStatus.js';
import useStartDiagnosticsScript from '@src/features/system/hooks/useStartDiagnosticsScript.js';
import useDownloadDiagnosticsFile from '@src/features/system/hooks/useDownloadDiagnosticsFile.js';

vi.mock('@src/features/system/hooks/useDiagnosticsStatus.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/system/hooks/useStartDiagnosticsScript.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/system/hooks/useDownloadDiagnosticsFile.js', () => ({ default: vi.fn() }));

const startDiagnostics = vi.fn();
const downloadDiagnostics = vi.fn();

const setStatusQuery = (overrides) => useDiagnosticsStatus.mockReturnValue({
    data: undefined,
    isLoading: false,
    ...overrides,
});

describe('DiagnosticsCard', () => {
    beforeEach(() => {
        startDiagnostics.mockReset();
        downloadDiagnostics.mockReset();
        useStartDiagnosticsScript.mockReturnValue({
            mutate: startDiagnostics,
            isPending: false,
            isPolling: false,
        });
        useDownloadDiagnosticsFile.mockReturnValue({
            mutate: downloadDiagnostics,
            isPending: false,
        });
    });

    it('shows a skeleton placeholder instead of the report form while the status is loading', () => {
        setStatusQuery({ isLoading: true });

        render(<DiagnosticsCard />);

        expect(screen.queryByLabelText('Report status')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Generate Report' })).not.toBeInTheDocument();
    });

    it('falls back to a no-reports message when no status is available (idle or error)', () => {
        setStatusQuery({ data: undefined });

        render(<DiagnosticsCard />);

        expect(screen.getByLabelText('Report status')).toHaveValue('There are no reports generated.');
    });

    it('shows the backend-reported status text instead of the fallback once a report exists', () => {
        setStatusQuery({ data: { status: 'Report running: 42%', completed: false } });

        render(<DiagnosticsCard />);

        expect(screen.getByLabelText('Report status')).toHaveValue('Report running: 42%');
    });

    it('disables the download button until the report is completed', () => {
        setStatusQuery({ data: { status: 'Report running: 42%', completed: false } });

        render(<DiagnosticsCard />);

        expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
    });

    it('enables the download button and triggers the download once the report is completed', () => {
        setStatusQuery({ data: { status: 'Report ready', completed: true } });

        render(<DiagnosticsCard />);

        const downloadButton = screen.getByRole('button', { name: 'Download' });
        expect(downloadButton).not.toBeDisabled();

        fireEvent.click(downloadButton);

        expect(downloadDiagnostics).toHaveBeenCalledTimes(1);
    });

    it('starts a new diagnostics run when Generate Report is clicked', () => {
        setStatusQuery({ data: undefined });

        render(<DiagnosticsCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Generate Report' }));

        expect(startDiagnostics).toHaveBeenCalledTimes(1);
    });

    it('disables Generate Report while the background poll is running, not only while the mutation is pending', () => {
        setStatusQuery({ data: undefined });
        useStartDiagnosticsScript.mockReturnValue({
            mutate: startDiagnostics,
            isPending: false,
            isPolling: true,
        });

        render(<DiagnosticsCard />);

        expect(screen.getByRole('button', { name: 'Generate Report' })).toBeDisabled();
    });
});
