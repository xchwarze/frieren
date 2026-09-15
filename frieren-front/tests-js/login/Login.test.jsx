/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Login from '@src/features/login/containers/Login/index.jsx';
import useUserLoginMutation from '@src/features/login/hooks/useUserLogin.js';

vi.mock('@src/features/login/hooks/useUserLogin.js', () => ({ default: vi.fn() }));

const loginMutation = vi.fn();

describe('Login', () => {
    beforeEach(() => {
        loginMutation.mockReset().mockResolvedValue({});
        useUserLoginMutation.mockReturnValue({ mutateAsync: loginMutation });
    });

    it('renders the username and password fields', () => {
        render(<Login />);

        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('blocks submission and shows validation errors when both fields are empty', async () => {
        render(<Login />);

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('The username is mandatory')).toBeInTheDocument();
        expect(screen.getByText('The password is mandatory')).toBeInTheDocument();
        expect(loginMutation).not.toHaveBeenCalled();
    });

    it('submits the entered credentials to the login mutation', async () => {
        render(<Login />);

        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(loginMutation).toHaveBeenCalledWith(
            { username: 'admin', password: 'secret' },
            expect.anything()
        ));
    });
});
