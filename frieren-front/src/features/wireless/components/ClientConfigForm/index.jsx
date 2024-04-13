import { useAtomValue } from 'jotai';
import * as yup from 'yup';
import PropTypes from 'prop-types';

import clientApListAtom from '@src/features/wireless/atoms/clientApListAtom.js';
import useSetClientConfig from '@src/features/wireless/hooks/useSetClientConfig.js';
import WirelessScanButton from '@src/features/wireless/components/WirelessScanButton';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';

const clientConfigSchema = yup.object({
    interface: yup.string().required('Interface selection is mandatory'),
    selectedAP: yup.object({
            bssid: yup.string().required(),
            ssid: yup.string().required('SSID is mandatory'),
            channel: yup.number().required(),
            signal: yup.string().required(),
            quality: yup.string().required(),
            security: yup.string().required('Security type is required'),
        })
        .required('Access Point is mandatory')
        .transform((value, originalValue) => JSON.parse(originalValue) ?? false),
    psk: yup.string().when('selectedAP', (selectedAP, schema) => {
        return selectedAP.security !== 'Open'
            ? schema.required('PSK is mandatory when security is not Open').min(8, 'PSK must be at least 8 characters').max(63, 'PSK must be no more than 63 characters')
            : schema.notRequired();
    }),
});

/**
 * Generates a form for configuring client settings.
 *
 * @param {Object} wirelessInterfaces - The list of wireless interfaces available.
 * @return {ReactElement} The form component for configuring client settings.
 */
const ClientConfigForm = ({ wirelessInterfaces }) => {
    const clientApList = useAtomValue(clientApListAtom);
    const { mutateAsync: setWirelessConfig } = useSetClientConfig();

    const interfaceList = wirelessInterfaces ?? [];

    return (
        <FormProvider autoComplete={'off'} schema={clientConfigSchema} onSubmit={setWirelessConfig}>
            <SelectField
                name={'interface'}
                label={'Wireless Interface'}
                options={interfaceList}
            />
            <SelectField
                name={'selectedAP'}
                label={'Access Point'}
                options={clientApList}
            />
            <InputField
                name={'psk'}
                label={'PSK'}
                type={'password'}
            />
            <WirelessScanButton />
            <SubmitButton
                label={'Connect'}
                icon={'globe'}
                className={'ms-2'}
                disabled={clientApList.length === 0}
            />
        </FormProvider>
    );
};

ClientConfigForm.propTypes = {
    wirelessInterfaces: PropTypes.array,
}

export default ClientConfigForm;
