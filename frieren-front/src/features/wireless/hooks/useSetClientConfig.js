import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_CLIENT_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Generates a custom hook to set client configuration by making an authenticated mutation.
 *
 * @return {Function} The mutation hook.
 */
const useSetClientConfig = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ interface: wlanInterface, selectedAP, psk }) => fetchPost({
            module: 'wireless',
            action: 'setClientConfig',
            interface: wlanInterface,
            bssid: selectedAP.bssid,
            ssid: selectedAP.ssid,
            security: selectedAP.security,
            psk,
        }),
        onSuccess: async () => {
            await sleep(2500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_CLIENT_CONFIG]
            });
        }
    });
};

export default useSetClientConfig;
