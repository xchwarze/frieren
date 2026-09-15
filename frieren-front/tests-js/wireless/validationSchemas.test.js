/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { interfaceSchema, radioConfigSchema } from '@src/features/wireless/helpers/validationSchemas.js';

describe('interfaceSchema', () => {
    const apValues = {
        mode: 'ap',
        ssid: 'MyNetwork',
        network: 'lan',
        encryption: 'none',
        key: '',
        hidden: false,
        disabled: false,
        isManagement: false,
        isRecon: false,
    };

    it('requires ssid, network and encryption outside monitor mode', async () => {
        expect(await interfaceSchema.isValid({ ...apValues, ssid: '' })).toBe(false);
        expect(await interfaceSchema.isValid({ ...apValues, network: '' })).toBe(false);
        expect(await interfaceSchema.isValid({ ...apValues, encryption: '' })).toBe(false);
    });

    it('accepts a fully populated ap configuration', async () => {
        expect(await interfaceSchema.isValid(apValues)).toBe(true);
    });

    it('drops the ssid/network/encryption requirement in monitor mode', async () => {
        const monitorValues = { ...apValues, mode: 'monitor', ssid: '', network: '', encryption: '' };

        expect(await interfaceSchema.isValid(monitorValues)).toBe(true);
    });

    it('does not require a key when encryption is none', async () => {
        expect(await interfaceSchema.isValid({ ...apValues, encryption: 'none', key: '' })).toBe(true);
    });

    it('requires an 8-63 character key once a real encryption is selected', async () => {
        const encrypted = { ...apValues, encryption: 'psk2' };

        expect(await interfaceSchema.isValid({ ...encrypted, key: '' })).toBe(false);
        expect(await interfaceSchema.isValid({ ...encrypted, key: 'short' })).toBe(false);
        expect(await interfaceSchema.isValid({ ...encrypted, key: 'a'.repeat(64) })).toBe(false);
        expect(await interfaceSchema.isValid({ ...encrypted, key: 'longenoughkey' })).toBe(true);
    });

    it('never requires a key in monitor mode, even with a non-none encryption value still set', async () => {
        const monitorValues = { ...apValues, mode: 'monitor', encryption: 'psk2', key: '' };

        expect(await interfaceSchema.isValid(monitorValues)).toBe(true);
    });
});

describe('radioConfigSchema', () => {
    const fullConfig = { channel: '6', txpower: '20', htmode: 'HE40', country: '00', disabled: false };

    it('accepts a fully populated radio configuration', async () => {
        expect(await radioConfigSchema.isValid(fullConfig)).toBe(true);
    });

    it.each(['channel', 'txpower', 'htmode', 'country'])('requires %s', async (field) => {
        expect(await radioConfigSchema.isValid({ ...fullConfig, [field]: '' })).toBe(false);
    });
});
