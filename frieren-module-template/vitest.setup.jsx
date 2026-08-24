/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 *
 * Adapted from frieren-modules-private/evilportal/vitest.setup.jsx. Mocks the @common
 * components a scaffolded module is most likely to render, so a component test doesn't need
 * a real frieren-front checkout (VITE_COMMON_ALIAS) just to resolve them. Anything imported
 * from @common that ISN'T mocked here still resolves for real, via vitest.config.js's alias.
 *
 * NOTE: evilportal's own version of this file also mocks '@common/components/Form' as one
 * monolithic default export (Form.Group/Form.Select/etc, the react-bootstrap Form shape).
 * That path does NOT exist in frieren's real shared SDK — the form system is individual
 * subpath imports only (@common/components/Form/{FormProvider,InputField,SwitchField,...},
 * see CHEATSHEET.md §6.6) — so that mock was deliberately dropped here rather than copied:
 * vi.mock() would make it "pass" in tests while `yarn build` fails to resolve the same import
 * for real. Add a per-field mock (or point at the real files) if you need to test a form.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Keep jsdom isolated between React Testing Library cases.
afterEach(cleanup);

vi.mock('@common/components/PanelCard', () => {
    const PanelCard = ({ title, subtitle, children, refetch, isFetching, headerActions, ...props }) => (
        <div {...props} data-testid="panel-card">
            {title && <h5 className="card-title">{title}</h5>}
            {subtitle && <p className="text-body-secondary small">{subtitle}</p>}
            {headerActions && <div className="d-flex align-items-center gap-2">{headerActions}</div>}
            {isFetching && <div data-testid="skeleton-bar" />}
            {children}
        </div>
    );
    PanelCard.displayName = 'PanelCard';
    return { default: PanelCard };
});

vi.mock('@common/components/FormActions', () => {
    const FormActions = ({ children, ...props }) => (
        <div className="form-actions d-flex gap-2" {...props}>{children}</div>
    );
    FormActions.displayName = 'FormActions';
    return { default: FormActions };
});

vi.mock('@common/components/SkeletonBar', () => {
    const SkeletonBar = ({ width, height, barHeight, ...props }) => (
        <div
            className="skeleton-bar"
            style={{ width, height, '--skeleton-height': barHeight }}
            data-testid="skeleton-bar"
            {...props}
        />
    );
    SkeletonBar.displayName = 'SkeletonBar';
    return { default: SkeletonBar };
});

vi.mock('@common/components/Button', () => {
    const Button = ({ label, icon, variant, size, loading, disabled, onClick, children, ...props }) => (
        <button
            className={`btn btn-${variant || 'primary'} ${size ? `btn-${size}` : ''} ${loading ? 'disabled' : ''}`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {icon && <i className={`bi bi-${icon} me-1`} />}
            {label || children}
            {loading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true" />}
        </button>
    );
    Button.displayName = 'Button';
    return { default: Button };
});
