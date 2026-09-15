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

    test('getAvailableDevices returns the live device list', async ({ api }) => {
        const { response, json } = await api.post('network', 'getAvailableDevices');
        expect(response.ok()).toBeTruthy();
        expect(json).not.toHaveProperty('error');
        expect(json).toHaveProperty('devices');
        expect(Array.isArray(json.devices)).toBe(true);
        expect(json.devices.length).toBeGreaterThan(0);
        expect(json.devices).not.toContain('lo');
    });

    test('addInterface/removeInterface round-trip a real interface with device/mtu/macaddr/peerdns, cleaning up after', async ({ api }) => {
        const name = 'e2etest';

        // Best-effort pre-clean in case a prior failed run left it behind.
        await api.post('network', 'removeInterface', { name });

        try {
            const devicesResult = await api.post('network', 'getAvailableDevices');
            const device = devicesResult.json.devices[0];

            const added = await api.post('network', 'addInterface', {
                name,
                device,
                proto: 'dhcp',
                mtu: '1400',
                macaddr: 'AA:BB:CC:DD:EE:FF',
                peerdns: false,
            });
            expect(added.response.ok()).toBeTruthy();
            expect(added.json).not.toHaveProperty('error');

            const afterAdd = await api.post('network', 'getInterfaces');
            const created = afterAdd.json.interfaces.find((iface) => iface.name === name);
            expect(created).toBeDefined();
            expect(created.device).toBe(device);
            expect(created.mtu).toBe('1400');
            expect(created.macaddr).toBe('AA:BB:CC:DD:EE:FF');
            expect(created.peerdns).toBe(false);

            const duplicate = await api.post('network', 'addInterface', { name, device, proto: 'dhcp' });
            expect(duplicate.json.error).toContain('already exists');

            const restarted = await api.post('network', 'toggleInterface', { name, state: 'restart' });
            expect(restarted.response.ok()).toBeTruthy();
            expect(restarted.json).not.toHaveProperty('error');
        } finally {
            const removed = await api.post('network', 'removeInterface', { name });
            expect(removed.json).not.toHaveProperty('error');

            // The live ubus dump getInterfaces() reads briefly still lists a just-removed
            // interface until netifd finishes processing the reload; poll instead of a
            // single immediate read.
            await expect.poll(async () => {
                const afterRemove = await api.post('network', 'getInterfaces');
                return afterRemove.json.interfaces.some((iface) => iface.name === name);
            }, { timeout: 5000 }).toBe(false);
        }
    });
});
