/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import HostnameCard from '@src/features/settings/components/HostnameCard/index.jsx';
import useSetHostname from '@src/features/settings/hooks/useSetHostname';

vi.mock('@src/features/settings/hooks/useSetHostname', () => ({ default: vi.fn() }));

const setHostname = vi.fn();

describe('HostnameCard', () => {
    beforeEach(() => {
        setHostname.mockReset().mockResolvedValue({});
        useSetHostname.mockReturnValue({ mutateAsync: setHostname });
    });

    it('shows skeleton placeholders instead of the field while the section data is loading', () => {
        render(<HostnameCard query={{ isLoading: true }} />);

        expect(screen.queryByLabelText('Hostname')).not.toBeInTheDocument();
    });

    it('pre-fills the field with the hostname loaded from the backend', () => {
        render(<HostnameCard query={{ isLoading: false, data: { hostname: 'router-01' } }} />);

        expect(screen.getByLabelText('Hostname')).toHaveValue('router-01');
    });

    it('submits the edited hostname', async () => {
        render(<HostnameCard query={{ isLoading: false, data: { hostname: 'router-01' } }} />);

        fireEvent.change(screen.getByLabelText('Hostname'), { target: { value: 'new-router' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setHostname).toHaveBeenCalledWith({ hostname: 'new-router' }, expect.anything()));
    });

    it('blocks submission and shows a validation error when the hostname is cleared', async () => {
        render(<HostnameCard query={{ isLoading: false, data: { hostname: 'router-01' } }} />);

        fireEvent.change(screen.getByLabelText('Hostname'), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('Hostname is mandatory')).toBeInTheDocument();
        expect(setHostname).not.toHaveBeenCalled();
    });
});
