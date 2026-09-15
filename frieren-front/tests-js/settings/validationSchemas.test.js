/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import {
    hostnameSchema,
    timezoneSchema,
    themeSchema,
    updatePasswordSchema,
    terminalSettingsSchema,
} from '@src/features/settings/helpers/validationSchemas.js';

describe('hostnameSchema', () => {
    it('accepts a non-empty hostname', async () => {
        await expect(hostnameSchema.isValid({ hostname: 'router-01' })).resolves.toBe(true);
    });

    it('rejects an empty hostname', async () => {
        await expect(hostnameSchema.isValid({ hostname: '' })).resolves.toBe(false);
        await expect(hostnameSchema.validate({ hostname: '' })).rejects.toThrow('Hostname is mandatory');
    });
});

describe('timezoneSchema', () => {
    it('accepts a selected timezone', async () => {
        await expect(timezoneSchema.isValid({ timezone: 'GMT-3' })).resolves.toBe(true);
    });

    it('rejects an empty timezone', async () => {
        await expect(timezoneSchema.validate({ timezone: '' })).rejects.toThrow('Timezone is mandatory');
    });
});

describe('themeSchema', () => {
    it('accepts a selected theme', async () => {
        await expect(themeSchema.isValid({ theme: 'dark' })).resolves.toBe(true);
    });

    it('rejects an empty theme', async () => {
        await expect(themeSchema.validate({ theme: '' })).rejects.toThrow('Theme selection is mandatory');
    });
});

describe('updatePasswordSchema', () => {
    const validPayload = { currentPassword: 'old-secret', newPassword: 'new-secret', confirmPassword: 'new-secret' };

    it('accepts a current password plus a matching new/confirm pair', async () => {
        await expect(updatePasswordSchema.isValid(validPayload)).resolves.toBe(true);
    });

    it('rejects a missing current password', async () => {
        await expect(updatePasswordSchema.validate({ ...validPayload, currentPassword: '' }))
            .rejects.toThrow('Current password is mandatory');
    });

    it('rejects a new password shorter than 6 characters', async () => {
        await expect(updatePasswordSchema.validate({ ...validPayload, newPassword: 'ab1', confirmPassword: 'ab1' }))
            .rejects.toThrow('Password must be at least 6 characters');
    });

    it('rejects a confirmation that does not match the new password', async () => {
        await expect(updatePasswordSchema.validate({ ...validPayload, confirmPassword: 'something-else' }))
            .rejects.toThrow('Passwords must match');
    });
});

describe('terminalSettingsSchema', () => {
    const validPayload = {
        terminalTheme: 'dracula',
        fontSize: 14,
        cursorStyle: 'block',
        cursorBlink: true,
        terminalAutologin: false,
        terminalEnabled: true,
    };

    it('accepts a fully populated settings payload', async () => {
        await expect(terminalSettingsSchema.isValid(validPayload)).resolves.toBe(true);
    });

    it('rejects a font size below the 8pt minimum', async () => {
        await expect(terminalSettingsSchema.validate({ ...validPayload, fontSize: 4 })).rejects.toThrow('Minimum 8');
    });

    it('rejects a font size above the 32pt maximum', async () => {
        await expect(terminalSettingsSchema.validate({ ...validPayload, fontSize: 40 })).rejects.toThrow('Maximum 32');
    });

    it('rejects a cursor style outside the allowed block/underline/bar set', async () => {
        await expect(terminalSettingsSchema.isValid({ ...validPayload, cursorStyle: 'blink' })).resolves.toBe(false);
    });
});
