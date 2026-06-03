import { test, expect } from './api-fixture.js';

test.describe('API: Wireless', () => {
    test('getWirelessOverview returns radios as keyed object', async ({ api }) => {
        const { response, json } = await api.post('wireless', 'getWirelessOverview');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');

        const radioNames = Object.keys(json);
        expect(radioNames.length).toBeGreaterThan(0);

        const radio = json[radioNames[0]];
        expect(radio).toHaveProperty('band');
        expect(radio).toHaveProperty('up');
        expect(radio).toHaveProperty('interfaces');
        expect(Array.isArray(radio.interfaces)).toBe(true);

        if (radio.interfaces.length > 0) {
            const iface = radio.interfaces[0];
            expect(iface).toHaveProperty('ifname');
            expect(iface).toHaveProperty('mode');
            expect(iface).toHaveProperty('encryption');
        }
    });

    test('getRadioConfig returns radio hardware config', async ({ api }) => {
        const overview = await api.post('wireless', 'getWirelessOverview');
        const radioNames = Object.keys(overview.json);
        test.skip(radioNames.length === 0, 'No radios available');

        const { response, json } = await api.post('wireless', 'getRadioConfig', {
            radio: radioNames[0],
        });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
    });

    test('getAssociationList returns stations for interface', async ({ api }) => {
        const overview = await api.post('wireless', 'getWirelessOverview');
        const radioNames = Object.keys(overview.json);
        test.skip(radioNames.length === 0, 'No radios available');

        const radio = overview.json[radioNames[0]];
        test.skip(!radio.interfaces[0], 'No interfaces on first radio');

        const { response, json } = await api.post('wireless', 'getAssociationList', {
            interface: radio.interfaces[0].ifname,
        });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
    });

    test('scanForNetworks returns scan results', async ({ api }) => {
        const overview = await api.post('wireless', 'getWirelessOverview');
        const radioNames = Object.keys(overview.json);
        test.skip(radioNames.length === 0, 'No radios available');

        const { response, json } = await api.post('wireless', 'scanForNetworks', {
            device: radioNames[0],
        });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
    });

    test('getRawWirelessConfig returns raw UCI text', async ({ api }) => {
        const { response, json } = await api.post('wireless', 'getRawWirelessConfig');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('content');
        expect(typeof json.content).toBe('string');
        expect(json.content).toContain('config wifi-device');
    });
});
