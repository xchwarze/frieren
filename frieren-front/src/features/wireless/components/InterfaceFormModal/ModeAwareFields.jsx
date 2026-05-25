/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';

import InputField from '@src/components/Form/InputField';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import { NETWORK_OPTIONS, ENCRYPTION_OPTIONS } from '@src/features/wireless/helpers/constants.js';

const ModeAwareFields = () => {
    const mode = useWatch({ name: 'mode', defaultValue: 'ap' });
    const encryption = useWatch({ name: 'encryption', defaultValue: 'none' });

    if (mode === 'monitor') {
        return <SwitchField name={'isRecon'} label={'Recon Interface'} />;
    }

    return (
        <>
            <InputField name={'ssid'} label={'SSID'} />
            <SelectField name={'network'} label={'Network'} options={NETWORK_OPTIONS} />
            <SelectField name={'encryption'} label={'Encryption'} options={ENCRYPTION_OPTIONS} />
            {encryption !== 'none' && (
                <InputField name={'key'} label={'Key / Passphrase'} type={'password'} />
            )}
            {mode === 'ap' && <SwitchField name={'hidden'} label={'Hidden AP'} />}
            {mode === 'ap' && (
                <SwitchField name={'isManagement'} label={'Management Interface'} />
            )}
        </>
    );
};

export default ModeAwareFields;
