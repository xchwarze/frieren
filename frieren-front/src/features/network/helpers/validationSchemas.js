/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';

const requiredForStatic = (message) => yup.string().when('proto', {
    is: 'static',
    then: (schema) => schema.required(message),
    otherwise: (schema) => schema.notRequired(),
});

export const interfaceSchema = yup.object({
    proto: yup.string().required('Protocol is mandatory'),
    ipaddr: requiredForStatic('IP address is mandatory'),
    netmask: requiredForStatic('Netmask is mandatory'),
    gateway: yup.string().notRequired(),
    dns: yup.string().notRequired(),
});

export const staticLeaseSchema = yup.object({
    name: yup.string().required('Name is mandatory'),
    mac: yup.string()
        .required('MAC address is mandatory')
        .matches(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/, 'Invalid MAC address'),
    ip: yup.string()
        .required('IP address is mandatory')
        .matches(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IPv4 address'),
});
