/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import PropTypes from 'prop-types';

import useDisableWwanInterface from '@src/features/wireless/hooks/useDisableWwanInterface.js';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import Button from '@src/components/Button';

/**
 * React component for rendering the ClientInfoForm.
 *
 * @param {Object} clientConfig - configuration object for the client
 * @return {ReactElement} React component
 */
const ClientInfoForm = ({ clientConfig }) => {
    const { mutate, isPending } = useDisableWwanInterface();

    const defaultValues = {
        interface: clientConfig?.interface ?? '',
        selectedAP: clientConfig?.ssid ?? '',
    };

    const scanInterface = useCallback(() => {
        mutate({ interfaceName: clientConfig.interface });
    }, [mutate, clientConfig.interface]);

    return (
        <FormProvider autoComplete={'off'} onSubmit={() => {}} defaultValues={defaultValues}>
            <InputField
                name={'interface'}
                label={'Wireless Interface'}
                disabled={true}
            />
            <InputField
                name={'selectedAP'}
                label={'Access Point'}
                disabled={true}
            />
            <Button
                label={'Disconnect'}
                icon={'stop-circle'}
                onClick={scanInterface}
                loading={isPending}
            />
        </FormProvider>
    );
};

ClientInfoForm.propTypes = {
    clientConfig: PropTypes.object.isRequired,
}

export default ClientInfoForm;
