/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import useScanForNetworks from '@src/features/wireless/hooks/useScanForNetworks.js';
import Button from '@src/components/Button';

/**
 * Renders a button with an icon that trigger a network scan.
 *
 * @return {ReactElement} The WirelessScanButton component
 */
const WirelessScanButton = () => {
    const { mutate, isPending } = useScanForNetworks();
    const selectedInterface = useWatch({
        name: 'interface',
        defaultValue: false,
    });

    const scanInterface = useCallback(() => {
        if (selectedInterface) {
            mutate({ interfaceName: selectedInterface });
        }
    }, [mutate, selectedInterface]);

    return (
        <Button
            label={'Scan'}
            icon={'loader'}
            onClick={scanInterface}
            loading={isPending}
        />
    );
};

export default WirelessScanButton;
