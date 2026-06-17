/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

/**
 * Single source of truth for the module `manifest.json` schema.
 * Imported by both `validate.js` (full-object validation) and `wizard.js`
 * (per-field prompt validation) so the two never drift.
 */
import fs from 'fs-extra';
import path from 'path';
import * as yup from 'yup';
import semver from 'semver';

// Yup's built-in email is too loose / inconsistent across versions — pin our own.
yup.addMethod(yup.string, 'email', function validateEmail(message) {
    return this.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message,
        name: 'email',
        excludeEmptyString: true,
    });
});

// Backend Router requires this charset for the routing key / namespace stem.
export const MODULE_NAME_REGEX = /^[a-z0-9_]+$/;

// The 212 Feather glyphs shipped in assets/fonts/frieren-icons (see ui-layout.spec §12).
export const ICON_GLYPHS = new Set([
    'activity', 'alert-circle', 'alert-octagon', 'alert-triangle', 'aperture', 'archive', 'arrow-down',
    'arrow-down-circle', 'arrow-down-left', 'arrow-down-right', 'arrow-left', 'arrow-left-circle', 'arrow-right',
    'arrow-right-circle', 'arrow-up', 'arrow-up-circle', 'arrow-up-left', 'arrow-up-right', 'at-sign', 'bar-chart',
    'bar-chart-2', 'bell', 'bell-off', 'bluetooth', 'bookmark', 'box', 'briefcase', 'calendar', 'camera', 'cast',
    'check', 'check-circle', 'check-square', 'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up',
    'chevrons-down', 'chevrons-left', 'chevrons-right', 'chevrons-up', 'chrome', 'circle', 'clipboard', 'clock',
    'cloud', 'cloud-drizzle', 'cloud-lightning', 'cloud-off', 'cloud-rain', 'cloud-snow', 'code', 'coffee', 'columns',
    'command', 'compass', 'copy', 'corner-down-left', 'corner-down-right', 'corner-left-down', 'corner-left-up',
    'corner-right-down', 'corner-right-up', 'corner-up-left', 'corner-up-right', 'cpu', 'crop', 'crosshair', 'database',
    'delete', 'disc', 'download', 'download-cloud', 'droplet', 'edit', 'edit-2', 'edit-3', 'external-link', 'eye',
    'eye-off', 'fast-forward', 'file', 'file-minus', 'file-plus', 'file-text', 'filter', 'flag', 'folder',
    'folder-minus', 'folder-plus', 'github', 'globe', 'grid', 'hard-drive', 'hash', 'heart', 'help-circle', 'home',
    'image', 'inbox', 'info', 'key', 'layers', 'layout', 'life-buoy', 'link', 'link-2', 'loader', 'lock', 'log-in',
    'log-out', 'mail', 'map-pin', 'maximize', 'maximize-2', 'menu', 'message-circle', 'message-square', 'minimize',
    'minimize-2', 'minus', 'minus-circle', 'minus-square', 'monitor', 'moon', 'more-horizontal', 'more-vertical',
    'mouse-pointer', 'move', 'navigation', 'navigation-2', 'package', 'paperclip', 'pause', 'pause-circle', 'percent',
    'pie-chart', 'play', 'play-circle', 'plus', 'plus-circle', 'plus-square', 'pocket', 'power', 'printer', 'radio',
    'refresh-ccw', 'refresh-cw', 'repeat', 'rewind', 'rotate-ccw', 'rotate-cw', 'rss', 'save', 'scissors', 'search',
    'send', 'server', 'settings', 'share', 'share-2', 'shield', 'shield-off', 'shuffle', 'sidebar', 'skip-back',
    'skip-forward', 'slash', 'sliders', 'smartphone', 'speaker', 'square', 'star', 'stop-circle', 'sun', 'tag',
    'target', 'terminal', 'thermometer', 'thumbs-down', 'thumbs-up', 'toggle-left', 'toggle-right', 'tool', 'trash',
    'trash-2', 'trello', 'trending-down', 'trending-up', 'triangle', 'unlock', 'upload', 'upload-cloud', 'user',
    'user-check', 'user-minus', 'user-plus', 'user-x', 'users', 'video', 'video-off', 'wifi', 'wifi-off', 'wind',
    'x', 'x-circle', 'x-octagon', 'x-square', 'zap', 'zap-off', 'zoom-in', 'zoom-out',
]);

// Glyphs the core panel reserves for navigation — a sidebar module reusing one
// grows look-alike sidebar entries (see ui-layout.spec §12).
export const RESERVED_ICON_GLYPHS = new Set([
    'trello', 'grid', 'package', 'settings', 'cpu', 'radio', 'share-2', 'menu', 'sidebar', 'power', 'refresh-cw',
]);

// Reusable field schemas (wizard validates prompt-by-prompt with these).
export const stringRequiredSchema = yup.string().required('This field is required.');
export const emailSchema = yup.string().email('Please enter a valid email address.').required('This field is required.');
export const urlSchema = yup.string().url('Please enter a valid URL.').required('This field is required.');
export const optionalUrlSchema = yup.string().url('Please enter a valid URL.').optional();
export const nameSchema = yup.string()
    .matches(MODULE_NAME_REGEX, 'Lowercase letters, digits and underscore only (no spaces or hyphens).')
    .required('Module name is required.');
export const semverSchema = yup.string()
    .test('semver', 'Must be a valid semver version (x.y.z).', (value) => !!semver.valid(value))
    .required('Version is required.');
export const optionalSemverSchema = yup.string()
    .test('semver', 'Must be a valid semver version (x.y.z).', (value) => value == null || value === '' || !!semver.valid(value))
    .optional();

const authorSchema = yup.object().shape({
    name: yup.string().required('Author name is required.'),
    email: emailSchema,
});

export const manifestSchema = yup.object().shape({
    name: nameSchema,
    title: yup.string().required('Title is required.'),
    description: yup.string().required('Module description is required.'),
    version: semverSchema,
    authors: yup.array().of(authorSchema).min(1, 'At least one author is required.').required('Authors are required.'),
    keywords: yup.array().of(yup.string()).default([]),
    icon: yup.string().when('forceSidebar', {
        is: true,
        then: (schema) => schema.required('Sidebar modules (forceSidebar:true) require an icon.'),
        otherwise: (schema) => schema.optional(),
    }),
    repository: urlSchema,
    documentation: optionalUrlSchema,
    license: yup.string().optional(),
    guestType: yup.array().of(
        yup.string().oneOf(['OpenWrt', 'RaspberryPi'], 'GuestType must be either OpenWrt or RaspberryPi.')
    ).default([]),
    dependencies: yup.array().of(yup.string()).default([]),
    minPanelVersion: optionalSemverSchema,
    system: yup.boolean().required('System flag is required.'),
    forceSidebar: yup.boolean().required('ForceSidebar flag is required.'),
    order: yup.number().integer().positive().optional(),
});

/**
 * Validates the `icon` value beyond "is a string": a PNG must exist on disk,
 * a glyph must be in the Feather set, and a sidebar module should avoid the
 * reserved nav glyphs. Returns { errors: string[], warnings: string[] }.
 */
export const validateIcon = (manifest, publicDir) => {
    const errors = [];
    const warnings = [];
    const icon = manifest.icon;

    if (!icon) {
        return { errors, warnings };
    }

    if (icon.toLowerCase().endsWith('.png')) {
        const iconPath = path.join(publicDir, icon);
        if (!fs.existsSync(iconPath)) {
            errors.push(`Icon file "${icon}" not found in ${publicDir}.`);
        }
        return { errors, warnings };
    }

    if (!ICON_GLYPHS.has(icon)) {
        errors.push(`Icon "${icon}" is not a Feather glyph (and not a .png file). See ui-layout.spec §12.`);
    } else if (manifest.forceSidebar && RESERVED_ICON_GLYPHS.has(icon)) {
        warnings.push(`Icon "${icon}" is a reserved nav glyph; a sidebar module should pick a distinct glyph (§12).`);
    }

    return { errors, warnings };
};
