/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { interfaceSchema, staticLeaseSchema } from '@src/features/network/helpers/validationSchemas.js';

describe('interfaceSchema', () => {
    it('requires ipaddr and netmask only for the static protocol', async () => {
        const values = { proto: 'static', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);

        const error = await interfaceSchema.validate(values, { abortEarly: false }).catch((e) => e);
        expect(error.errors).toEqual(expect.arrayContaining(['IP address is mandatory', 'Netmask is mandatory']));
    });

    it('does not require ipaddr/netmask for dhcp', async () => {
        const values = { proto: 'dhcp', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('does not require ipaddr/netmask for dhcpv6 either', async () => {
        const values = { proto: 'dhcpv6', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('accepts a fully filled static configuration', async () => {
        const values = {
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: '1.1.1.1',
        };

        expect(await interfaceSchema.isValid(values)).toBe(true);
    });

    it('always requires a protocol, regardless of the other fields', async () => {
        const values = { proto: '', ipaddr: '', netmask: '', gateway: '', dns: '' };

        expect(await interfaceSchema.isValid(values)).toBe(false);
    });

    it('never requires gateway or dns, even for static', async () => {
        const values = {
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '',
            dns: '',
        };

        expect(await interfaceSchema.isValid(values)).toBe(true);
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
