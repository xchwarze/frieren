/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Switch, Route, useLocation } from 'wouter';
import { ErrorBoundary } from 'react-error-boundary';

import useModulesList from '@src/hooks/useModulesList.js';
import Layout from '@src/components/Layout';
import NotFoundPage from '@src/components/NotFoundPage';
import DynamicModule from '@src/components/DynamicModule';
import ErrorFallback from '@src/components/ErrorFallback';
import Dashboard from '@src/features/dashboard/containers/Dashboard';
import Modules from '@src/features/modules/containers/Modules';
import Packages from '@src/features/packages/containers/Packages';
import System from '@src/features/system/containers/System';
import Network from '@src/features/network/containers/Network';
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
    const [location] = useLocation();

    return (
        <Layout>
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location]}>
                <Switch>
                    {modules.map(({ name, title, version }) => (
                        // Optional :tab? segment so modules using PanelTabs (which
                        // canonicalizes the URL to /<name>/<tab>) keep matching their
                        // route instead of falling through to NotFound.
                        <Route key={name} path={`/${name}/:tab?`}>
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
                    <Route path='/system/:tab?' component={System} />
                    <Route path='/network/:tab?' component={Network} />
                    <Route path='/settings' component={Settings} />
                    <Route path='/wireless/:tab?' component={Wireless} />
                    <Route component={NotFoundPage} />
                </Switch>
            </ErrorBoundary>
        </Layout>
    );
};

export default LoginStack;
