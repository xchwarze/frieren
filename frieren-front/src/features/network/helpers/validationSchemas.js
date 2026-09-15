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

const MTU_MIN = 576;
const MTU_MAX = 9216;

export const interfaceSchema = yup.object({
    name: yup.string()
        .required('Interface name is mandatory')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Invalid interface name'),
    device: yup.string().required('Device is mandatory'),
    proto: yup.string().required('Protocol is mandatory'),
    ipaddr: requiredForStatic('IP address is mandatory'),
    netmask: requiredForStatic('Netmask is mandatory'),
    gateway: yup.string().notRequired(),
    dns: yup.string().notRequired(),
    mtu: yup.string()
        .notRequired()
        .matches(/^\d+$/, { message: 'Invalid MTU', excludeEmptyString: true })
        .test('mtu-range', `MTU must be between ${MTU_MIN} and ${MTU_MAX}`, (value) => (
            !value || (Number(value) >= MTU_MIN && Number(value) <= MTU_MAX)
        )),
    macaddr: yup.string()
        .notRequired()
        .matches(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/, { message: 'Invalid MAC address', excludeEmptyString: true }),
    peerdns: yup.boolean(),
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
