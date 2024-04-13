import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_CLIENT_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Disable the WWAN interface.
 *
 * @return {Function} The mutation hook.
 */
const useDisableWwanInterface = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ interface: wlanInterface }) => fetchPost({
            module: 'wireless',
            action: 'disableWwanInterface',
            interface: wlanInterface,
        }),
        onSuccess: async () => {
            await sleep(4500);
            queryClient.invalidateQueries({
                queryKey: [WIRELESS_GET_CLIENT_CONFIG]
            });
        }
    });
};

export default useDisableWwanInterface;
