/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * InterfaceFormModal's own job is mapping an `iface` (wire shape, `dns` as an array) into
 * the form's `defaultValues` (a single space-separated string), deciding add vs. edit mode,
 * and gating when the form mounts at all — not the form's submit/validation behavior, which
 * is InterfaceForm's own concern (see InterfaceForm.test.jsx). InterfaceForm is mocked here
 * so this stays a unit test of that mapping/gating logic instead of a duplicate of the
 * form's tests.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import InterfaceFormModal from '@src/features/network/components/InterfaceFormModal/index.jsx';
import InterfaceForm from '@src/features/network/components/InterfaceFormModal/InterfaceForm.jsx';

vi.mock('@src/features/network/components/InterfaceFormModal/InterfaceForm.jsx', () => ({
    default: vi.fn(() => <div data-testid={'interface-form'} />),
}));

describe('InterfaceFormModal', () => {
    beforeEach(() => {
        InterfaceForm.mockClear();
    });

    it('does not mount the form when hidden', () => {
        render(<InterfaceFormModal show={false} onHide={vi.fn()} iface={null} />);

        expect(InterfaceForm).not.toHaveBeenCalled();
    });

    it('mounts the form in add mode when shown with no interface selected', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={null} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({
                isEditMode: false,
                defaultValues: expect.objectContaining({ name: '', device: '', proto: 'static' }),
            }),
            expect.anything()
        );
    });

    it('mounts the form in edit mode when an interface is selected', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={{ name: 'lan' }} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({ isEditMode: true }),
            expect.anything()
        );
    });

    it('maps an array dns into a space-separated string for the form', () => {
        const iface = { name: 'wan', proto: 'static', ipaddr: '10.0.0.1', netmask: '255.255.255.0', dns: ['1.1.1.1', '8.8.8.8'] };
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={iface} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({
                isEditMode: true,
                defaultValues: expect.objectContaining({
                    name: 'wan',
                    proto: 'static',
                    ipaddr: '10.0.0.1',
                    netmask: '255.255.255.0',
                    dns: '1.1.1.1 8.8.8.8',
                }),
            }),
            expect.anything()
        );
    });

    it('falls back to the default protocol and blank addressing for a bare interface', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={{ name: 'lan' }} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultValues: {
                    name: 'lan',
                    device: '',
                    proto: 'static',
                    ipaddr: '',
                    netmask: '',
                    gateway: '',
                    dns: '',
                    mtu: '',
                    macaddr: '',
                    peerdns: true,
                },
            }),
            expect.anything()
        );
    });

    it('leaves an already-string dns untouched', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={{ name: 'lan', dns: '9.9.9.9' }} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({ defaultValues: expect.objectContaining({ dns: '9.9.9.9' }) }),
            expect.anything()
        );
    });

    it('carries mtu, macaddr and peerdns from the interface into defaultValues', () => {
        const iface = { name: 'lan', mtu: '1400', macaddr: 'AA:BB:CC:DD:EE:FF', peerdns: false };
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={iface} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultValues: expect.objectContaining({
                    mtu: '1400',
                    macaddr: 'AA:BB:CC:DD:EE:FF',
                    peerdns: false,
                }),
            }),
            expect.anything()
        );
    });

    it('carries device from the interface into defaultValues', () => {
        const iface = { name: 'lan', device: 'br-lan' };
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={iface} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({ defaultValues: expect.objectContaining({ device: 'br-lan' }) }),
            expect.anything()
        );
    });

    it('shows the Edit Interface title while editing', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={{ name: 'lan' }} />);

        expect(screen.getByText('Edit Interface')).toBeInTheDocument();
    });

    it('shows the Add Interface title while adding', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={null} />);

        expect(screen.getByText('Add Interface')).toBeInTheDocument();
    });

    it('calls onHide when the modal is closed', () => {
        const onHide = vi.fn();
        render(<InterfaceFormModal show={true} onHide={onHide} iface={{ name: 'lan' }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
