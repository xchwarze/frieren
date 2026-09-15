/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `ModeAwareFields` now sources its "Network" select's options from the `network` module's
 * `getInterfaces` action (via the wireless feature's own `useGetNetworkInterfaces` hook) instead
 * of the old hardcoded `NETWORK_OPTIONS` list. `fetchPost` is mocked at the module boundary — no
 * real network call — and each test builds its own `QueryClient` (retries disabled). The
 * harness mirrors `InterfaceForm.jsx` (the real production consumer): the app's own
 * `FormProvider` plus a real sibling `SelectField` registering `mode` — `ModeAwareFields` itself
 * never registers `mode`, only watches it (`useWatch({name:'mode'})`, deliberately with no
 * `defaultValue` — see `ModeAwareFields.jsx`'s comment on why), so a harness that never
 * registers `mode` anywhere would leave that watch reading `undefined` forever; the sibling
 * `SelectField` above is what makes it observe the form's real value.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import ModeAwareFields from '@src/features/wireless/components/InterfaceFormModal/ModeAwareFields.jsx';
import { MODE_OPTIONS } from '@src/features/wireless/helpers/constants.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_NETWORK_INTERFACES } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({
    fetchPost: vi.fn(),
}));

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const Harness = ({ defaultValues, radio = 'radio0' }) => {
    const values = { mode: 'ap', encryption: 'none', network: '', ...defaultValues };

    return (
        <FormProvider onSubmit={() => Promise.resolve()} defaultValues={values}>
            <SelectField name={'mode'} label={'Mode'} options={MODE_OPTIONS} />
            <ModeAwareFields radio={radio} />
        </FormProvider>
    );
};

const renderModeAwareFields = ({ defaultValues, radio = 'radio0', queryClient = createTestQueryClient() } = {}) => {
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <Harness defaultValues={defaultValues} radio={radio} />
        </QueryClientProvider>
    );

    return { ...utils, queryClient };
};

describe('ModeAwareFields', () => {
    beforeEach(() => {
        fetchPost.mockReset();
    });

    it('renders network options from the network interfaces query instead of the hardcoded list', async () => {
        fetchPost.mockResolvedValue({ interfaces: [{ name: 'lan' }, { name: 'guest2' }] });

        renderModeAwareFields();

        expect(await screen.findByRole('option', { name: 'Lan' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Guest2' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'WWAN' })).not.toBeInTheDocument();
    });

    it('disables the network select and shows a loading placeholder while fetching', () => {
        fetchPost.mockReturnValue(new Promise(() => {}));

        renderModeAwareFields();

        const select = screen.getByLabelText('Network');
        expect(select).toBeDisabled();
        expect(within(select).getByRole('option', { name: 'Loading networks…' })).toBeInTheDocument();
        expect(within(select).getAllByRole('option')).toHaveLength(1);
    });

    it('shows a disabled no-networks placeholder when the query resolves empty', async () => {
        fetchPost.mockResolvedValue({ interfaces: [] });

        renderModeAwareFields();

        const select = screen.getByLabelText('Network');
        expect(await within(select).findByRole('option', { name: 'No networks found' })).toBeInTheDocument();
        expect(select).toBeDisabled();
        expect(within(select).getAllByRole('option')).toHaveLength(1);
    });

    it('preserves an existing network value across the loading-to-resolved transition', async () => {
        let resolveFetch;
        fetchPost.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve; }));

        renderModeAwareFields({ defaultValues: { network: 'wan2' } });

        const select = screen.getByLabelText('Network');
        expect(select).toHaveValue('wan2');
        expect(select).toBeDisabled();

        resolveFetch({ interfaces: [{ name: 'lan' }, { name: 'wan2' }] });

        expect(await within(select).findByRole('option', { name: 'Wan2' })).toBeInTheDocument();
        expect(select).toHaveValue('wan2');
        expect(select).not.toBeDisabled();
    });

    it('keeps showing cached options, enabled, during a background refetch', async () => {
        const queryClient = createTestQueryClient();
        queryClient.setQueryData([WIRELESS_GET_NETWORK_INTERFACES], { interfaces: [{ name: 'lan' }] });
        fetchPost.mockReturnValue(new Promise(() => {}));

        renderModeAwareFields({ queryClient });

        await waitFor(() => expect(fetchPost).toHaveBeenCalled());
        const select = screen.getByLabelText('Network');
        expect(select).not.toBeDisabled();
        expect(within(select).getByRole('option', { name: 'Lan' })).toBeInTheDocument();
    });

    it('does not fetch network or encryption capabilities in monitor mode', async () => {
        fetchPost.mockResolvedValue({ interfaces: [] });

        renderModeAwareFields({ defaultValues: { mode: 'monitor' } });

        await screen.findByLabelText('Recon Interface');
        expect(fetchPost).not.toHaveBeenCalledWith(
            expect.objectContaining({ module: 'network', action: 'getInterfaces' })
        );
        expect(fetchPost).not.toHaveBeenCalledWith(
            expect.objectContaining({ module: 'wireless', action: 'getEncryptionOptions' })
        );
    });

    it('shows an error placeholder, not loading/empty, when the request fails with no cached data', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));

        renderModeAwareFields();

        const select = screen.getByLabelText('Network');
        expect(await within(select).findByRole('option', { name: 'Unable to load networks' })).toBeInTheDocument();
        expect(select).toBeDisabled();
        expect(within(select).queryByRole('option', { name: 'Loading networks…' })).not.toBeInTheDocument();
        expect(within(select).queryByRole('option', { name: 'No networks found' })).not.toBeInTheDocument();
    });

    it('keeps showing the no-networks placeholder during a background refetch of an empty result', async () => {
        const queryClient = createTestQueryClient();
        queryClient.setQueryData([WIRELESS_GET_NETWORK_INTERFACES], { interfaces: [] });
        fetchPost.mockReturnValue(new Promise(() => {}));

        renderModeAwareFields({ queryClient });

        await waitFor(() => expect(fetchPost).toHaveBeenCalled());
        const select = screen.getByLabelText('Network');
        expect(select).toBeDisabled();
        expect(within(select).getByRole('option', { name: 'No networks found' })).toBeInTheDocument();
        expect(within(select).queryByRole('option', { name: 'Loading networks…' })).not.toBeInTheDocument();
    });

    it('keeps showing cached options, enabled, when a background refetch fails', async () => {
        const queryClient = createTestQueryClient();
        queryClient.setQueryData([WIRELESS_GET_NETWORK_INTERFACES], { interfaces: [{ name: 'lan' }] });
        fetchPost.mockRejectedValue(new Error('refetch failed'));

        renderModeAwareFields({ queryClient });

        await waitFor(() => (
            expect(queryClient.getQueryState([WIRELESS_GET_NETWORK_INTERFACES]).status).toBe('error')
        ));

        const select = screen.getByLabelText('Network');
        expect(select).not.toBeDisabled();
        expect(within(select).getByRole('option', { name: 'Lan' })).toBeInTheDocument();
        expect(within(select).queryByRole('option', { name: 'Unable to load networks' })).not.toBeInTheDocument();
    });

    it('renders encryption options from the encryption capabilities query', async () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : Promise.resolve({
                    options: [
                        { value: 'none', label: 'None' },
                        { value: 'sae', label: 'WPA3-SAE (device)' },
                    ],
                })
        ));

        renderModeAwareFields({ radio: 'radio1' });

        const select = screen.getByLabelText('Encryption');
        expect(await within(select).findByRole('option', { name: 'WPA3-SAE (device)' })).toBeInTheDocument();
        expect(select).not.toBeDisabled();
        expect(fetchPost).toHaveBeenCalledWith({
            module: 'wireless',
            action: 'getEncryptionOptions',
            radio: 'radio1',
            mode: 'ap',
        });
    });

    it('shows a disabled encryption loading placeholder while capabilities are pending', () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : new Promise(() => {})
        ));

        renderModeAwareFields({ defaultValues: { encryption: 'sae' } });

        const select = screen.getByLabelText('Encryption');
        expect(select).toBeDisabled();
        expect(within(select).getByRole('option', { name: 'Loading encryption options…' })).toBeInTheDocument();
        expect(select).toHaveValue('sae');
    });

    it('shows a disabled empty encryption placeholder when no capabilities are reported', async () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : Promise.resolve({ options: [] })
        ));

        renderModeAwareFields();

        const select = screen.getByLabelText('Encryption');
        expect(await within(select).findByRole('option', { name: 'No encryption options found' })).toBeInTheDocument();
        expect(select).toBeDisabled();
        expect(within(select).getAllByRole('option')).toHaveLength(1);
    });

    it('shows a disabled encryption error placeholder when capabilities fail cold', async () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : Promise.reject(new Error('features unavailable'))
        ));

        renderModeAwareFields({ defaultValues: { encryption: 'sae' } });

        const select = screen.getByLabelText('Encryption');
        expect(await within(select).findByRole('option', { name: 'Unable to load encryption options' })).toBeInTheDocument();
        expect(select).toBeDisabled();
        expect(select).toHaveValue('sae');
    });

    it('shows Management Frame Protection in ap mode only, not sta or monitor', () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : Promise.resolve({ options: [{ value: 'none', label: 'None' }] })
        ));

        const { unmount } = renderModeAwareFields({ defaultValues: { ieee80211w: '0' } });
        expect(screen.getByLabelText('Management Frame Protection')).toBeInTheDocument();
        unmount();

        renderModeAwareFields({ defaultValues: { mode: 'sta', ieee80211w: '0' } });
        expect(screen.queryByLabelText('Management Frame Protection')).not.toBeInTheDocument();

        renderModeAwareFields({ defaultValues: { mode: 'monitor' } });
        expect(screen.queryByLabelText('Management Frame Protection')).not.toBeInTheDocument();
    });

    it('shows BSSID in sta mode only, not ap or monitor', () => {
        fetchPost.mockImplementation(({ module }) => (
            module === 'network'
                ? Promise.resolve({ interfaces: [{ name: 'lan' }] })
                : Promise.resolve({ options: [{ value: 'none', label: 'None' }] })
        ));

        const { unmount } = renderModeAwareFields({ defaultValues: { mode: 'sta', bssid: '' } });
        expect(screen.getByLabelText('BSSID (optional)')).toBeInTheDocument();
        unmount();

        renderModeAwareFields({ defaultValues: { ieee80211w: '0' } });
        expect(screen.queryByLabelText('BSSID (optional)')).not.toBeInTheDocument();

        renderModeAwareFields({ defaultValues: { mode: 'monitor' } });
        expect(screen.queryByLabelText('BSSID (optional)')).not.toBeInTheDocument();
    });
});
