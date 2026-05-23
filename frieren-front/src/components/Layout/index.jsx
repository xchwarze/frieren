/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import Header from '@src/components/Header';
import Sidebar from '@src/components/Sidebar';
import Terminal from '@src/features/terminal/containers';

/**
 * Webapp layout component with a header, sidebar, main content area, and terminal.
 *
 * @param {ReactNode} children - The content to be rendered inside the main content area.
 * @return {ReactElement} The rendered layout component.
 */
const Layout = ({ children }) => (
    <div className={'d-flex flex-column vh-100'}>
        <Header />
        <div className={'d-flex flex-grow-1 overflow-hidden'}>
            <Sidebar />
            <div className={'d-flex flex-column flex-grow-1 overflow-hidden'}>
                <div className={'d-flex flex-column flex-grow-1 overflow-auto gap-3 p-3 main-container'}>
                    {children}
                </div>
                <Terminal />
            </div>
        </div>
    </div>
);

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

export default Layout;
