/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';

export const hostnameSchema = yup.object({
    hostname: yup.string().required('Hostname is mandatory')
}).required();

export const timezoneSchema = yup.object({
    timezone: yup.string().required('Timezone is mandatory')
}).required();

export const themeSchema = yup.object({
    theme: yup.string().required('Theme selection is mandatory')
}).required();

export const updatePasswordSchema = yup.object({
    currentPassword: yup.string().required('Current password is mandatory'),
    newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is mandatory'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match')
}).required();

export const terminalSettingsSchema = yup.object({
    terminalTheme: yup.string().required('Theme selection is mandatory'),
    fontSize: yup.number().min(8, 'Minimum 8').max(32, 'Maximum 32').required('Font size is required'),
    cursorStyle: yup.string().oneOf(['block', 'underline', 'bar']).required(),
    cursorBlink: yup.boolean(),
    terminalAutologin: yup.boolean(),
}).required();
