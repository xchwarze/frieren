import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import useInterval from '@src/hooks/useInterval.js';
import isPollingActiveAtom from '@src/features/hardware/atoms/isPollingActiveAtom.js';
import { HARDWARE_GET_DIAGNOSTICS_STATUS } from '@src/features/hardware/helpers/queryKeys.js';

/**
 * Generates a function that starts and stops polling the diagnostics status.
 *
 * @return {Object} An object containing functions to start and stop polling manually.
 */
const usePollDiagnosticsStatus = () => {
    const [isPollingActive, setIsPollingActive] = useAtom(isPollingActiveAtom);
    const queryClient = useQueryClient();

    const startPolling = () => {
        setIsPollingActive(true);
    };

    const stopPolling = () => {
        setIsPollingActive(false);
    };

    const checkDiagnosticsStatus = async () => {
        await queryClient.refetchQueries({
            queryKey: [HARDWARE_GET_DIAGNOSTICS_STATUS],
            active: true,
        });
        const queryState = queryClient.getQueryState([HARDWARE_GET_DIAGNOSTICS_STATUS]);
        if (queryState?.data?.completed) {
            setIsPollingActive(false);
        }
    };

    useInterval(checkDiagnosticsStatus, isPollingActive ? 600 : null);

    return { startPolling, stopPolling };
};

export default usePollDiagnosticsStatus;
