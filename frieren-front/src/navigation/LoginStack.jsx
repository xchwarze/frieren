/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Switch, Route } from 'wouter';
import { ErrorBoundary } from 'react-error-boundary';

import useModulesList from '@src/hooks/useModulesList.js';
import Layout from '@src/components/Layout';
import NotFoundPage from '@src/components/NotFoundPage';
import DynamicModule from '@src/components/DynamicModule';
import ErrorFallback from '@src/components/ErrorFallback';
import Dashboard from '@src/features/dashboard/containers/Dashboard';
import Modules from '@src/features/modules/containers/Modules';
import Packages from '@src/features/packages/containers/Packages';
import Hardware from '@src/features/hardware/containers/Hardware';
import Settings from '@src/features/settings/containers/Settings';
import Wireless from '@src/features/wireless/containers/Wireless';

/**
 * Generate the login stack based on modules list.
 *
 * @return {ReactElement} The login stack component
 */
const LoginStack = () => {
    const { data } = useModulesList();
    const modules = data?.external ?? [];

    return (
        <Layout>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Switch>
                    {modules.map(({ name, title, version }) => (
                        <Route key={name} path={`/${name}`}>
                            <DynamicModule
                                name={name}
                                title={title}
                                version={version}
                            />
                        </Route>
                    ))}
                    <Route path='/dashboard' component={Dashboard} />
                    <Route path='/modules' component={Modules} />
                    <Route path='/packages' component={Packages} />
                    <Route path='/hardware' component={Hardware} />
                    <Route path='/settings' component={Settings} />
                    <Route path='/wireless' component={Wireless} />
                    <Route component={NotFoundPage} />
                </Switch>
            </ErrorBoundary>
        </Layout>
    );
};

export default LoginStack;
