/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { interfaceSchema, staticLeaseSchema } from '@src/features/network/helpers/validationSchemas.js';

describe('interfaceSchema', () => {
    const validName = 'wan';
    const validDevice = 'br-lan';

    it('requires ipaddr and netmask only for the static protocol', async () => {
        const values = { name: validName, device: validDevice, proto: 'static', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);

        const error = await interfaceSchema.validate(values, { abortEarly: false }).catch((e) => e);
        expect(error.errors).toEqual(expect.arrayContaining(['IP address is mandatory', 'Netmask is mandatory']));
    });

    it('does not require ipaddr/netmask for dhcp', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('does not require ipaddr/netmask for dhcpv6 either', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcpv6', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('accepts a fully filled static configuration', async () => {
        const values = {
            name: validName,
            device: validDevice,
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: '1.1.1.1',
        };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('always requires a protocol, regardless of the other fields', async () => {
        const values = { name: validName, device: validDevice, proto: '', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });

    it('never requires gateway or dns, even for static', async () => {
        const values = {
            name: validName,
            device: validDevice,
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '',
            dns: '',
        };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('requires a name', async () => {
        const values = { name: '', device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);

        const error = await interfaceSchema.validate(values, { abortEarly: false }).catch((e) => e);
        expect(error.errors).toEqual(expect.arrayContaining(['Interface name is mandatory']));
    });

    it('rejects a name with characters outside the whitelist', async () => {
        const values = { name: 'lan; rm -rf /', device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });

    it('accepts a name with letters, digits, underscores and hyphens', async () => {
        const values = { name: 'guest_wifi-1', device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('requires a device', async () => {
        const values = { name: validName, device: '', proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);

        const error = await interfaceSchema.validate(values, { abortEarly: false }).catch((e) => e);
        expect(error.errors).toEqual(expect.arrayContaining(['Device is mandatory']));
    });

    it('does not require mtu, macaddr or peerdns', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('accepts a valid mtu and macaddr', async () => {
        const values = {
            name: validName,
            device: validDevice,
            proto: 'dhcp',
            ipaddr: '',
            netmask: '',
            gateway: '',
            dns: '',
            mtu: '1500',
            macaddr: 'AA:BB:CC:DD:EE:FF',
            peerdns: false,
        };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('only validates macaddr format when it is non-empty', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '', macaddr: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('rejects a malformed macaddr', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '', macaddr: 'not-a-mac' };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });

    it('only validates mtu format/range when it is non-empty', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '', mtu: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('rejects a non-numeric mtu', async () => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '', mtu: 'abc' };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });

    it.each([
        ['too small', '100'],
        ['too large', '99999'],
    ])('rejects an out-of-range mtu (%s)', async (_label, mtu) => {
        const values = { name: validName, device: validDevice, proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '', mtu };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });
});

describe('staticLeaseSchema', () => {
    const validValues = { name: 'my-device', mac: '00:11:22:33:44:55', ip: '192.168.1.50' };

    it('accepts a fully valid lease', async () => {
        expect(await staticLeaseSchema.isValid(validValues)).toBe(true);
    });

    it('requires a name', async () => {
        expect(await staticLeaseSchema.isValid({ ...validValues, name: '' })).toBe(false);
    });

    it.each([
        ['missing', ''],
        ['too short', '00:11:22:33:44'],
        ['not colon-separated', '001122334455'],
        ['out-of-range octet count', '00:11:22:33:44:55:66'],
    ])('rejects a MAC address that is %s', async (_label, mac) => {
        expect(await staticLeaseSchema.isValid({ ...validValues, mac })).toBe(false);
    });

    it.each([
        ['missing', ''],
        ['only three octets', '192.168.1'],
        ['non-numeric', '192.168.1.abc'],
    ])('rejects an IPv4 address that is %s', async (_label, ip) => {
        expect(await staticLeaseSchema.isValid({ ...validValues, ip })).toBe(false);
    });
});
