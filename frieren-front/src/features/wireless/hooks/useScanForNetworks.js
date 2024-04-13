import { useSetAtom } from 'jotai';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import clientApListAtom from '@src/features/wireless/atoms/clientApListAtom.js';

/**
 * Generates a custom hook that triggers a network scan using the authenticated mutation.
 *
 * @return {Function} The mutation hook.
 */
const useScanForNetworks = () => {
    const setClientApList = useSetAtom(clientApListAtom);

    return useAuthenticatedMutation({
        mutationFn: ({ interfaceName }) => fetchPost({
            module: 'wireless',
            action: 'scanForNetworks',
            interface: interfaceName,
        }),
        onSuccess: (data) => {
            const networkOptions = data?.map(network => ({
                value: JSON.stringify(network),
                label: `${network.ssid} - ${network.bssid} (${network.quality}) [${network.security}]`
            }));
            setClientApList(networkOptions);
        }
    });
};
export default useScanForNetworks;
