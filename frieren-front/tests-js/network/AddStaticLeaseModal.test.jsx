/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The real `staticLeaseSchema` drives validation here (not mocked) — this is what actually
 * gates a malformed MAC/IP from reaching the backend, complementing the direct schema unit
 * tests in validationSchemas.test.js with the end-to-end field/error wiring.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AddStaticLeaseModal from '@src/features/network/components/DhcpCard/AddStaticLeaseModal.jsx';
import useAddStaticLease from '@src/features/network/hooks/useAddStaticLease.js';

vi.mock('@src/features/network/hooks/useAddStaticLease.js', () => ({ default: vi.fn() }));

const addMutation = vi.fn();

const fillField = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillValidLease = () => {
    fillField('Name', 'my-device');
    fillField('MAC Address', '00:11:22:33:44:55');
    fillField('IP Address', '192.168.1.50');
};

describe('AddStaticLeaseModal', () => {
    beforeEach(() => {
        addMutation.mockReset().mockResolvedValue({});
        useAddStaticLease.mockReturnValue({ mutateAsync: addMutation });
    });

    it('does not render the form at all while hidden', () => {
        render(<AddStaticLeaseModal show={false} onHide={vi.fn()} />);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    });

    it('submits the entered lease and closes the modal', async () => {
        const onHide = vi.fn();
        render(<AddStaticLeaseModal show={true} onHide={onHide} />);

        fillValidLease();
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        await waitFor(() => expect(addMutation).toHaveBeenCalledWith({
            name: 'my-device',
            mac: '00:11:22:33:44:55',
            ip: '192.168.1.50',
        }));
        await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
    });

    it('blocks submit and reports all three errors when every field is blank', async () => {
        render(<AddStaticLeaseModal show={true} onHide={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        expect(await screen.findByText('Name is mandatory')).toBeInTheDocument();
        expect(screen.getByText('MAC address is mandatory')).toBeInTheDocument();
        expect(screen.getByText('IP address is mandatory')).toBeInTheDocument();
        expect(addMutation).not.toHaveBeenCalled();
    });

    it('rejects a malformed MAC address without calling the mutation', async () => {
        render(<AddStaticLeaseModal show={true} onHide={vi.fn()} />);

        fillField('Name', 'my-device');
        fillField('MAC Address', 'not-a-mac');
        fillField('IP Address', '192.168.1.50');
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        expect(await screen.findByText('Invalid MAC address')).toBeInTheDocument();
        expect(addMutation).not.toHaveBeenCalled();
    });

    it('rejects a malformed IPv4 address without calling the mutation', async () => {
        render(<AddStaticLeaseModal show={true} onHide={vi.fn()} />);

        fillField('Name', 'my-device');
        fillField('MAC Address', '00:11:22:33:44:55');
        fillField('IP Address', 'not-an-ip');
        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        expect(await screen.findByText('Invalid IPv4 address')).toBeInTheDocument();
        expect(addMutation).not.toHaveBeenCalled();
    });

    it('cancels without submitting', () => {
        const onHide = vi.fn();
        render(<AddStaticLeaseModal show={true} onHide={onHide} />);

        fillValidLease();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(addMutation).not.toHaveBeenCalled();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
