import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * A custom React hook that handles the installation of a module.
 *
 * @return {Object} The mutation object for installing a module.
 */
const useInstallModule = () => (
    useAuthenticatedMutation({
        mutationFn: ({ moduleName, destination }) => fetchPost({
            module: 'modules',
            action: 'installModule',
            moduleName,
            destination,
        })
    })
);

export default useInstallModule;
