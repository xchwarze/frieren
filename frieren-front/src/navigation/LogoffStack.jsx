/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
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
