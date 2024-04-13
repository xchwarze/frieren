import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Set the wireless configuration for the Management network.
 *
 * @return {Function} The mutation hook.
 */
const useSetManagementConfig = () => (
    useAuthenticatedMutation({
        mutationFn: ({ interface: wlanInterface, ssid, psk, hidden, disabled }) => fetchPost({
            module: 'wireless',
            action: 'setManagementConfig',
            interface: wlanInterface,
            ssid,
            psk,
            hidden,
            disabled,
        }),
    })
);

export default useSetManagementConfig;
