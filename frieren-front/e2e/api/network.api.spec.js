import { test, expect } from './api-fixture.js';

test.describe('API: Network', () => {
    test('getInterfaces returns interface list with addressing', async ({ api }) => {
        const { response, json } = await api.post('network', 'getInterfaces');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('interfaces');
        expect(Array.isArray(json.interfaces)).toBe(true);
        expect(json.interfaces.length).toBeGreaterThan(0);

        const iface = json.interfaces[0];
        expect(iface).toHaveProperty('name');
        expect(iface).toHaveProperty('proto');
        expect(iface).toHaveProperty('up');
        expect(iface).toHaveProperty('device');
    });

    test('getDhcpLeases returns active leases', async ({ api }) => {
        const { response, json } = await api.post('network', 'getDhcpLeases');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('leases');
        expect(Array.isArray(json.leases)).toBe(true);

        if (json.leases.length > 0) {
            const lease = json.leases[0];
            expect(lease).toHaveProperty('ip');
            expect(lease).toHaveProperty('mac');
            expect(lease).toHaveProperty('expires');
        }
    });

    test('getStaticLeases returns configured reservations', async ({ api }) => {
        const { response, json } = await api.post('network', 'getStaticLeases');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('leases');
        expect(Array.isArray(json.leases)).toBe(true);
    });

    test('getArpTable returns discovered neighbors', async ({ api }) => {
        const { response, json } = await api.post('network', 'getArpTable');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('neighbors');
        expect(Array.isArray(json.neighbors)).toBe(true);

        if (json.neighbors.length > 0) {
            const neighbor = json.neighbors[0];
            expect(neighbor).toHaveProperty('ip');
            expect(neighbor).toHaveProperty('mac');
        }
    });

    test('runPing returns command output for a valid host', async ({ api }) => {
        const { response, json } = await api.post('network', 'runPing', { host: '127.0.0.1' });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('output');
        expect(typeof json.output).toBe('string');
    });

    test('runTraceroute returns command output for a valid host', async ({ api }) => {
        const { response, json } = await api.post('network', 'runTraceroute', { host: '127.0.0.1' });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('output');
        expect(typeof json.output).toBe('string');
    });

    test('runNslookup returns command output for a valid host', async ({ api }) => {
        const { response, json } = await api.post('network', 'runNslookup', { host: 'localhost' });
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('output');
        expect(typeof json.output).toBe('string');
    });

    test('runPing rejects an invalid host', async ({ api }) => {
        const { json } = await api.post('network', 'runPing', { host: 'bad host; rm -rf /' });
        expect(json).toHaveProperty('error');
    });
});
