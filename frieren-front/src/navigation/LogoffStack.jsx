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
