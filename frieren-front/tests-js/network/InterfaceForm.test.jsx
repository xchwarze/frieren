/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Covers InterfaceForm's own submit/validation/error behavior — the protocol-conditional
 * field visibility itself is ProtoAwareFields' concern and is already covered by
 * tests-js/network/ProtoAwareFields.test.jsx, so it is exercised here only incidentally
 * (filling the fields a real static submit needs), not re-verified field-by-field.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import InterfaceForm from '@src/features/network/components/InterfaceFormModal/InterfaceForm.jsx';
import useSetInterface from '@src/features/network/hooks/useSetInterface.js';

vi.mock('@src/features/network/hooks/useSetInterface.js', () => ({ default: vi.fn() }));

const setInterfaceMutation = vi.fn();

const staticDefaults = { proto: 'static', ipaddr: '', netmask: '', gateway: '', dns: '' };

const renderInterfaceForm = (defaultValues = staticDefaults, onHide = vi.fn()) => {
    const utils = render(<InterfaceForm name={'wan'} defaultValues={defaultValues} onHide={onHide} />);
    return { ...utils, onHide };
};

const fillField = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('InterfaceForm', () => {
    beforeEach(() => {
        setInterfaceMutation.mockReset().mockResolvedValue({});
        useSetInterface.mockReturnValue({ mutateAsync: setInterfaceMutation });
    });

    it('shows the interface name read-only, not editable', () => {
        renderInterfaceForm();

        // ReadOnlyField's label isn't programmatically associated with its control
        // (no htmlFor/id), so it can't be found via getByLabelText.
        const nameField = screen.getByDisplayValue('wan');
        expect(nameField).toBeDisabled();
    });

    it('blocks submit and reports errors when a static interface is missing its addressing', async () => {
        renderInterfaceForm();

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('IP address is mandatory')).toBeInTheDocument();
        expect(screen.getByText('Netmask is mandatory')).toBeInTheDocument();
        expect(setInterfaceMutation).not.toHaveBeenCalled();
    });

    it('submits the static addressing and closes the modal on success', async () => {
        const { onHide } = renderInterfaceForm();

        fillField('IP Address', '192.168.1.1');
        fillField('Netmask', '255.255.255.0');
        fillField('Gateway', '192.168.1.254');
        fillField('DNS', '1.1.1.1');
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setInterfaceMutation).toHaveBeenCalledWith({
            name: 'wan',
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: '1.1.1.1',
        }));
        await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
    });

    it('submits a dynamic protocol without requiring static addressing', async () => {
        const { onHide } = renderInterfaceForm();

        fireEvent.change(screen.getByLabelText('Protocol'), { target: { value: 'dhcp' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setInterfaceMutation).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'wan', proto: 'dhcp' })
        ));
        await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
    });

    it('does not close the modal when the mutation fails', async () => {
        setInterfaceMutation.mockRejectedValue(new Error('boom'));
        const { onHide } = renderInterfaceForm({ ...staticDefaults, ipaddr: '1.1.1.1', netmask: '255.255.255.0' });

        // react-hook-form's handleSubmit rethrows the handler's rejection after its own
        // internal cleanup (clearing isSubmitting); the <form onSubmit> DOM handler never
        // awaits that returned promise, so this specific rejection is expected here and
        // would otherwise surface as an unhandled rejection in the test run.
        const swallowExpectedRejection = (reason) => {
            if (reason?.message !== 'boom') {
                throw reason;
            }
        };
        process.on('unhandledRejection', swallowExpectedRejection);

        try {
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => expect(setInterfaceMutation).toHaveBeenCalled());
            expect(onHide).not.toHaveBeenCalled();
        } finally {
            process.off('unhandledRejection', swallowExpectedRejection);
        }
    });

    it('cancels without submitting', () => {
        const { onHide } = renderInterfaceForm();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(setInterfaceMutation).not.toHaveBeenCalled();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
