/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import UpdateUserPasswordCard from '@src/features/settings/components/UpdateUserPasswordCard/index.jsx';
import useUpdateUserPassword from '@src/features/settings/hooks/useUpdateUserPassword';

vi.mock('@src/features/settings/hooks/useUpdateUserPassword', () => ({ default: vi.fn() }));

const updateUserPassword = vi.fn();

const fillPasswordForm = ({ current = 'old-secret', next = 'new-secret', confirm = next } = {}) => {
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: current } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: next } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: confirm } });
};

describe('UpdateUserPasswordCard', () => {
    beforeEach(() => {
        updateUserPassword.mockReset().mockResolvedValue({});
        useUpdateUserPassword.mockReturnValue({ mutateAsync: updateUserPassword });
    });

    it('submits the password change and clears the form afterwards', async () => {
        render(<UpdateUserPasswordCard />);

        fillPasswordForm();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(updateUserPassword).toHaveBeenCalledWith({
            currentPassword: 'old-secret',
            newPassword: 'new-secret',
            confirmPassword: 'new-secret',
        }));
        await waitFor(() => expect(screen.getByLabelText('New Password')).toHaveValue(''));
        expect(screen.getByLabelText('Current Password')).toHaveValue('');
        expect(screen.getByLabelText('Confirm New Password')).toHaveValue('');
    });

    it('blocks submission when the confirmation does not match the new password', async () => {
        render(<UpdateUserPasswordCard />);

        fillPasswordForm({ next: 'new-secret', confirm: 'something-else' });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
        expect(updateUserPassword).not.toHaveBeenCalled();
    });
});
