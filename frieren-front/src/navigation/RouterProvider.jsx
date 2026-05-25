/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Router } from 'wouter';
import { useAtomValue } from 'jotai';

import useHashLocation from '@src/hooks/useHashLocation.js';
import authAtom from '@src/atoms/authAtom.js';
import LoginStack from '@src/navigation/LoginStack.jsx';
import LogoffStack from '@src/navigation/LogoffStack.jsx';

/**
 * Renders different stacks based on the auth status.
 *
 * @return {ReactElement} The rendered JSX element
 */
const RouterProvider = () => {
    const authStatus = useAtomValue(authAtom);
    if (authStatus === null) {
        return null;
    }

    return (
        <Router hook={useHashLocation}>
            {authStatus ? <LoginStack /> : <LogoffStack />}
        </Router>
    );
};

export default RouterProvider;
