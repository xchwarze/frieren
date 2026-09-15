/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';

import SelectField from '@src/components/Form/SelectField';
import useGetAvailableDevices from '@src/features/network/hooks/useGetAvailableDevices.js';

/**
 * Add-mode only: the network device/bridge the new interface attaches to, sourced from
 * the live device list (never hardcoded — which devices exist varies by hardware).
 *
 * @return {ReactElement} The device select field.
 */
const DeviceField = () => {
    const currentDevice = useWatch({ name: 'device' });
    const { data, isError } = useGetAvailableDevices();

    let options;
    let disabled = false;
    if (data !== undefined) {
        const devices = data.devices ?? [];
        if (devices.length > 0) {
            options = devices.map((device) => ({ value: device, label: device }));
        } else {
            options = [{ value: '', label: 'No devices found' }];
            disabled = true;
        }
    } else if (isError) {
        options = [{ value: currentDevice ?? '', label: 'Unable to load devices' }];
        disabled = true;
    } else {
        options = [{ value: currentDevice ?? '', label: 'Loading devices…' }];
        disabled = true;
    }

    return <SelectField name={'device'} label={'Device'} options={options} disabled={disabled} />;
};

export default DeviceField;
