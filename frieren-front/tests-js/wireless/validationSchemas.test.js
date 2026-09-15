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
        ieee80211w: '0',
        bssid: '',
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

    it('requires ieee80211w in ap mode but not elsewhere', async () => {
        expect(await interfaceSchema.isValid({ ...apValues, ieee80211w: '' })).toBe(false);
        expect(await interfaceSchema.isValid({ ...apValues, mode: 'sta', ieee80211w: '' })).toBe(true);
        expect(await interfaceSchema.isValid({ ...apValues, mode: 'monitor', ieee80211w: '' })).toBe(true);
    });

    it('validates bssid format only in sta mode, and only when non-empty', async () => {
        const staValues = { ...apValues, mode: 'sta' };

        expect(await interfaceSchema.isValid({ ...staValues, bssid: '' })).toBe(true);
        expect(await interfaceSchema.isValid({ ...staValues, bssid: 'AA:BB:CC:DD:EE:FF' })).toBe(true);
        expect(await interfaceSchema.isValid({ ...staValues, bssid: 'not-a-mac' })).toBe(false);
        // Same malformed value is ignored outside sta mode - the field isn't shown there.
        expect(await interfaceSchema.isValid({ ...apValues, bssid: 'not-a-mac' })).toBe(true);
    });
});

describe('radioConfigSchema', () => {
    const fullConfig = {
        channel: '6',
        txpower: '20',
        htmode: 'HE40',
        country: '00',
        disabled: false,
        cellDensity: '0',
        distance: '0',
    };

    it('accepts a fully populated radio configuration', async () => {
        expect(await radioConfigSchema.isValid(fullConfig)).toBe(true);
    });

    it.each(['channel', 'txpower', 'htmode', 'country', 'cellDensity'])('requires %s', async (field) => {
        expect(await radioConfigSchema.isValid({ ...fullConfig, [field]: '' })).toBe(false);
    });

    it('requires distance and rejects a negative value', async () => {
        expect(await radioConfigSchema.isValid({ ...fullConfig, distance: '' })).toBe(false);
        expect(await radioConfigSchema.isValid({ ...fullConfig, distance: -5 })).toBe(false);
        expect(await radioConfigSchema.isValid({ ...fullConfig, distance: 500 })).toBe(true);
    });
});
