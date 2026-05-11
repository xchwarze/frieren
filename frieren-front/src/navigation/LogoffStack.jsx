/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Switch, Route } from 'wouter';

import NotFoundPage from '@src/components/NotFoundPage';
import Login from '@src/features/login/containers/Login';

/**
 * Generates the logoff stack.
 *
 * @return {ReactNode} The logoff stack component.
 */
const LogoffStack = () => (
    <Switch>
        <Route path='/login' component={Login} />
        <Route component={NotFoundPage} />
    </Switch>
);

export default LogoffStack;
