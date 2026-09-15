/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Covers InterfaceForm's own submit/validation/error behavior — the protocol-conditional
 * field visibility itself is ProtoAwareFields' concern and is already covered by
 * tests-js/network/ProtoAwareFields.test.jsx, so it is exercised here only incidentally
 * (filling the fields a real static submit needs), not re-verified field-by-field.
 * `useGetAvailableDevices` (consumed by the add-mode-only DeviceField) is mocked directly
 * rather than fetchPost+QueryClient, matching this suite's existing hook-mock convention.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import InterfaceForm from '@src/features/network/components/InterfaceFormModal/InterfaceForm.jsx';
import useSetInterface from '@src/features/network/hooks/useSetInterface.js';
import useAddInterface from '@src/features/network/hooks/useAddInterface.js';
import useGetAvailableDevices from '@src/features/network/hooks/useGetAvailableDevices.js';

vi.mock('@src/features/network/hooks/useSetInterface.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useAddInterface.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useGetAvailableDevices.js', () => ({ default: vi.fn() }));

const setInterfaceMutation = vi.fn();
const addInterfaceMutation = vi.fn();

const staticDefaults = {
    name: 'wan',
    device: 'br-lan',
    proto: 'static',
    ipaddr: '',
    netmask: '',
    gateway: '',
    dns: '',
    mtu: '',
    macaddr: '',
    peerdns: true,
};

const renderInterfaceForm = (defaultValues = staticDefaults, isEditMode = true, onHide = vi.fn()) => {
    const utils = render(<InterfaceForm isEditMode={isEditMode} defaultValues={defaultValues} onHide={onHide} />);
    return { ...utils, onHide };
};

const fillField = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('InterfaceForm', () => {
    beforeEach(() => {
        setInterfaceMutation.mockReset().mockResolvedValue({});
        addInterfaceMutation.mockReset().mockResolvedValue({});
        useSetInterface.mockReturnValue({ mutateAsync: setInterfaceMutation });
        useAddInterface.mockReturnValue({ mutateAsync: addInterfaceMutation });
        useGetAvailableDevices.mockReturnValue({ data: { devices: ['br-lan', 'eth0'] }, isError: false });
    });

    describe('edit mode', () => {
        it('shows the interface name read-only, not editable', () => {
            renderInterfaceForm();

            // ReadOnlyField's label isn't programmatically associated with its control
            // (no htmlFor/id), so it can't be found via getByLabelText.
            const nameField = screen.getByDisplayValue('wan');
            expect(nameField).toBeDisabled();
            expect(screen.queryByLabelText('Interface Name')).not.toBeInTheDocument();
        });

        it('does not render the Device field (device is not editable once created)', () => {
            renderInterfaceForm();

            expect(screen.queryByLabelText('Device')).not.toBeInTheDocument();
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
                device: 'br-lan',
                proto: 'static',
                ipaddr: '192.168.1.1',
                netmask: '255.255.255.0',
                gateway: '192.168.1.254',
                dns: '1.1.1.1',
                mtu: '',
                macaddr: '',
                peerdns: true,
            }));
            expect(addInterfaceMutation).not.toHaveBeenCalled();
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

        // Regression test: InterfaceFormModal seeds `defaultValues.name` to the interface's
        // real name in edit mode, and react-hook-form keeps every defaultValues key in its
        // internal form state whether or not an input for it is ever registered (no
        // shouldUnregister override anywhere in this app). So `values.name` in the submit
        // callback is the original name even though the name input is never rendered here.
        // If this ever breaks (e.g. someone adds shouldUnregister, or the name stops being
        // seeded), this test fails loudly instead of the form silently submitting an empty
        // or wrong name.
        it('submits the original name even though no name input is ever rendered', async () => {
            renderInterfaceForm({ ...staticDefaults, ipaddr: '1.1.1.1', netmask: '255.255.255.0' });

            expect(screen.queryByLabelText('Interface Name')).not.toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => expect(setInterfaceMutation).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'wan' })
            ));
            expect(addInterfaceMutation).not.toHaveBeenCalled();
        });

        it('round-trips mtu, macaddr and peerdns through submit', async () => {
            renderInterfaceForm({ ...staticDefaults, ipaddr: '1.1.1.1', netmask: '255.255.255.0' });

            fillField('MTU', '1400');
            fillField('MAC Address', 'AA:BB:CC:DD:EE:FF');
            fireEvent.click(screen.getByLabelText('Use DNS from protocol'));
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => expect(setInterfaceMutation).toHaveBeenCalledWith(expect.objectContaining({
                mtu: '1400',
                macaddr: 'AA:BB:CC:DD:EE:FF',
                peerdns: false,
            })));
        });

        it('rejects a malformed mac address', async () => {
            renderInterfaceForm({ ...staticDefaults, ipaddr: '1.1.1.1', netmask: '255.255.255.0' });

            fillField('MAC Address', 'not-a-mac');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(await screen.findByText('Invalid MAC address')).toBeInTheDocument();
            expect(setInterfaceMutation).not.toHaveBeenCalled();
        });

        it('rejects an out-of-range mtu', async () => {
            renderInterfaceForm({ ...staticDefaults, ipaddr: '1.1.1.1', netmask: '255.255.255.0' });

            fillField('MTU', '100');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(await screen.findByText(/MTU must be between/)).toBeInTheDocument();
            expect(setInterfaceMutation).not.toHaveBeenCalled();
        });
    });

    describe('add mode', () => {
        const addDefaults = {
            name: '',
            device: '',
            proto: 'static',
            ipaddr: '',
            netmask: '',
            gateway: '',
            dns: '',
            mtu: '',
            macaddr: '',
            peerdns: true,
        };

        it('renders an editable name input instead of the read-only field', () => {
            renderInterfaceForm(addDefaults, false);

            expect(screen.getByLabelText('Interface Name')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('wan')).not.toBeInTheDocument();
        });

        it('renders the Device field, populated from the live device list', () => {
            renderInterfaceForm(addDefaults, false);

            const deviceField = screen.getByLabelText('Device');
            expect(deviceField).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'br-lan' })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: 'eth0' })).toBeInTheDocument();
        });

        it('shows a disabled placeholder when no devices are reported', () => {
            useGetAvailableDevices.mockReturnValue({ data: { devices: [] }, isError: false });
            renderInterfaceForm(addDefaults, false);

            expect(screen.getByLabelText('Device')).toBeDisabled();
            expect(screen.getByRole('option', { name: 'No devices found' })).toBeInTheDocument();
        });

        it('requires a name before submitting', async () => {
            renderInterfaceForm(addDefaults, false);

            fillField('IP Address', '192.168.1.1');
            fillField('Netmask', '255.255.255.0');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(await screen.findByText('Interface name is mandatory')).toBeInTheDocument();
            expect(addInterfaceMutation).not.toHaveBeenCalled();
        });

        it('requires a device before submitting', async () => {
            renderInterfaceForm(addDefaults, false);

            fireEvent.change(screen.getByLabelText('Interface Name'), { target: { value: 'guest' } });
            fillField('IP Address', '192.168.1.1');
            fillField('Netmask', '255.255.255.0');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            expect(await screen.findByText('Device is mandatory')).toBeInTheDocument();
            expect(addInterfaceMutation).not.toHaveBeenCalled();
        });

        it('submits the typed name and selected device via addInterface, not setInterface', async () => {
            const { onHide } = renderInterfaceForm(addDefaults, false);

            fireEvent.change(screen.getByLabelText('Interface Name'), { target: { value: 'guest' } });
            fireEvent.change(screen.getByLabelText('Device'), { target: { value: 'eth0' } });
            fillField('IP Address', '192.168.1.1');
            fillField('Netmask', '255.255.255.0');
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => expect(addInterfaceMutation).toHaveBeenCalledWith(expect.objectContaining({
                name: 'guest',
                device: 'eth0',
                proto: 'static',
                ipaddr: '192.168.1.1',
                netmask: '255.255.255.0',
            })));
            expect(setInterfaceMutation).not.toHaveBeenCalled();
            await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
        });

        it('round-trips mtu, macaddr and peerdns through submit', async () => {
            renderInterfaceForm(addDefaults, false);

            fireEvent.change(screen.getByLabelText('Interface Name'), { target: { value: 'guest' } });
            fireEvent.change(screen.getByLabelText('Device'), { target: { value: 'br-lan' } });
            fillField('IP Address', '192.168.1.1');
            fillField('Netmask', '255.255.255.0');
            fillField('MTU', '1400');
            fillField('MAC Address', 'AA:BB:CC:DD:EE:FF');
            fireEvent.click(screen.getByLabelText('Use DNS from protocol'));
            fireEvent.click(screen.getByRole('button', { name: 'Save' }));

            await waitFor(() => expect(addInterfaceMutation).toHaveBeenCalledWith(expect.objectContaining({
                mtu: '1400',
                macaddr: 'AA:BB:CC:DD:EE:FF',
                peerdns: false,
            })));
        });
    });
});
