/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import * as yup from 'yup';

import useGetWirelessInterfaces from '@src/features/wireless/hooks/useGetWirelessInterfaces.js';
import useGetManagementConfig from '@src/features/wireless/hooks/useGetManagementConfig.js';
import useSetManagementConfig from '@src/features/wireless/hooks/useSetManagementConfig.js';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import InputField from '@src/components/Form/InputField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';

const wirelessConfigSchema = yup.object({
    interface: yup.string().required('Interface selection is mandatory'),
    ssid: yup.string().required('SSID is mandatory'),
    psk: yup.string().min(8, 'PSK must be at least 8 characters').max(63, 'PSK must be no more than 63 characters').required('PSK is mandatory'),
    hidden: yup.boolean(),
    disabled: yup.boolean(),
}).required();

/**
 * Generates a Wireless Management Card component with form fields for configuring wireless settings.
 *
 * @return {ReactElement} The rendered Wireless Management Card component
 */
const WirelessManagementCard = () => {
    const { data: wirelessInterfaces, refetch: refetchWirelessInterfaces, isFetching: isFetchingWirelessInterfaces } = useGetWirelessInterfaces();
    const { data: managementConfig, refetch: refetchManagementConfig, isFetching: isFetchingManagementConfig } = useGetManagementConfig();
    const { mutateAsync: setWirelessConfig } = useSetManagementConfig();
    const refetchAll = useCallback(() => {
        refetchWirelessInterfaces();
        refetchManagementConfig();
    }, [refetchWirelessInterfaces, refetchManagementConfig]);

    const interfaceList = wirelessInterfaces ?? [];
    const defaultValues = {
        psk: '',
        interface: managementConfig?.interface ?? '',
        ssid: managementConfig?.ssid ?? '',
        hidden: managementConfig?.hidden ?? false,
        disabled: managementConfig?.disabled ?? false,
    };

    return (
        <PanelCard
            title={'Wireless Management Interface'}
            isFetching={isFetchingWirelessInterfaces && isFetchingManagementConfig}
            refetch={refetchAll}
        >
            <FormProvider autoComplete={'off'} schema={wirelessConfigSchema} onSubmit={setWirelessConfig} defaultValues={defaultValues}>
                <SelectField
                    name={'interface'}
                    label={'Wireless Interface'}
                    options={interfaceList}
                />
                <InputField
                    name={'ssid'}
                    label={'SSID'}
                />
                <InputField
                    name={'psk'}
                    label={'PSK'}
                    type={'password'}
                />
                <SwitchField
                    name={'hidden'}
                    label={'Hidden AP'}
                />
                <SwitchField
                    name={'disabled'}
                    label={'Disabled AP'}
                />
                <SubmitButton />
            </FormProvider>
        </PanelCard>
    );
};

export default WirelessManagementCard;
