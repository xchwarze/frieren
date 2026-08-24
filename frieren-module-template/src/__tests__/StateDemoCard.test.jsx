/*
 * Project: Frieren Framework — module template
 * Example Vitest component test. StateDemoCard only needs the PanelCard/Button mocks from
 * vitest.setup.jsx — jotai atoms and wouter's useLocation() run for real, no provider needed.
 */
import { afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StateDemoCard from '@module/feature/components/StateDemoCard';

describe('StateDemoCard', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it('increments the plain jotai counter atom on click', async () => {
        render(<StateDemoCard />);

        expect(screen.getByText('Counter: 0')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Increment' }));

        expect(screen.getByText('Counter: 1')).toBeInTheDocument();
    });

    it('persists the atomWithStorage value to localStorage as the user types', async () => {
        render(<StateDemoCard />);

        const input = screen.getByPlaceholderText('Persisted value');
        await userEvent.type(input, 'hello');

        expect(input).toHaveValue('hello');
        expect(window.localStorage.getItem('demo-persisted-value')).toBe('"hello"');
    });

    it('renders the current wouter location without a Router provider', () => {
        render(<StateDemoCard />);

        expect(screen.getByText('Wouter location:')).toBeInTheDocument();
        expect(document.querySelector('code')).toBeInTheDocument();
    });
});
