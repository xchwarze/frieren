/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';

export const interfaceSchema = yup.object({
    mode: yup.string().required('Mode is mandatory'),
    ssid: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('SSID is mandatory'),
    }),
    network: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('Network is mandatory'),
    }),
    encryption: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('Encryption is mandatory'),
    }),
    key: yup.string().when(['encryption', 'mode'], {
        is: (encryption, mode) => mode !== 'monitor' && encryption && encryption !== 'none',
        then: (schema) => schema.required('Key is required').min(8, 'Min 8 characters').max(63, 'Max 63 characters'),
        otherwise: (schema) => schema.notRequired(),
    }),
    hidden: yup.boolean(),
    disabled: yup.boolean(),
    isManagement: yup.boolean(),
    isRecon: yup.boolean(),
    ieee80211w: yup.string().when('mode', {
        is: 'ap',
        then: (schema) => schema.required('Management Frame Protection is mandatory'),
        otherwise: (schema) => schema.notRequired(),
    }),
    bssid: yup.string().when('mode', {
        is: 'sta',
        then: (schema) => schema.matches(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/, {
            message: 'Invalid BSSID',
            excludeEmptyString: true,
        }),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export const radioConfigSchema = yup.object({
    channel: yup.string().required('Channel is mandatory'),
    txpower: yup.string().required('TX Power is mandatory'),
    htmode: yup.string().required('Mode is mandatory'),
    country: yup.string().required('Country is mandatory'),
    disabled: yup.boolean(),
    cellDensity: yup.string().required('Cell density is mandatory'),
    distance: yup.number()
        .typeError('Distance must be a number')
        .min(0, 'Distance cannot be negative')
        .required('Distance is mandatory'),
}).required();
