/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * InterfaceFormModal's own job is mapping an `iface` (wire shape, `dns` as an array) into
 * the form's `defaultValues` (a single space-separated string) and gating when the form
 * mounts at all — not the form's submit/validation behavior, which is InterfaceForm's own
 * concern (see InterfaceForm.test.jsx). InterfaceForm is mocked here so this stays a unit
 * test of that mapping/gating logic instead of a duplicate of the form's tests.
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

    it('does not mount the form when shown with no interface selected', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={null} />);

        expect(InterfaceForm).not.toHaveBeenCalled();
    });

    it('maps an array dns into a space-separated string for the form', () => {
        const iface = { name: 'wan', proto: 'static', ipaddr: '10.0.0.1', netmask: '255.255.255.0', dns: ['1.1.1.1', '8.8.8.8'] };
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={iface} />);

        expect(InterfaceForm).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'wan',
                defaultValues: expect.objectContaining({
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
                name: 'lan',
                defaultValues: { proto: 'static', ipaddr: '', netmask: '', gateway: '', dns: '' },
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

    it('shows the Edit Interface title while open', () => {
        render(<InterfaceFormModal show={true} onHide={vi.fn()} iface={{ name: 'lan' }} />);

        expect(screen.getByText('Edit Interface')).toBeInTheDocument();
    });

    it('calls onHide when the modal is closed', () => {
        const onHide = vi.fn();
        render(<InterfaceFormModal show={true} onHide={onHide} iface={{ name: 'lan' }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));

        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
