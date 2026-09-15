/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';

import InputField from '@src/components/Form/InputField';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import { ucfirst } from '@src/helpers/actionsHelper.js';
import useGetEncryptionOptions from '@src/features/wireless/hooks/useGetEncryptionOptions.js';
import useGetNetworkInterfaces from '@src/features/wireless/hooks/useGetNetworkInterfaces.js';

const ModeAwareFields = ({ radio }) => {
    // No `defaultValue` here (unlike `encryption` below): this value now gates whether
    // `useGetNetworkInterfaces` fetches at all (REQ-007). `useWatch`'s own `defaultValue`
    // literally wins on the very first render regardless of the form's real value (it only
    // self-corrects afterward), which would fire that request once on mount for every
    // monitor-mode interface before the correction lands. Omitting it makes the first render
    // read the real registered value (the sibling Mode `SelectField` in `InterfaceForm.jsx`
    // always registers it) instead of a stale literal fallback.
    const mode = useWatch({ name: 'mode' });
    const encryption = useWatch({ name: 'encryption', defaultValue: 'none' });
    const currentNetworkValue = useWatch({ name: 'network' });
    const { data, isError } = useGetNetworkInterfaces({ enabled: mode !== 'monitor' });
    const { data: encryptionData, isError: encryptionIsError } = useGetEncryptionOptions(radio, mode);

    // Gated on data PRESENCE (`data !== undefined`), not `isSuccess`/`isError`/`isFetching`:
    // `isFetching` is true both for a first fetch and any later background refetch, and
    // `isSuccess` flips to `false` the moment a background refetch of already-cached data
    // fails (query-core's reducer unconditionally sets `status: 'error'` on any failed fetch,
    // success or not, while leaving `data` untouched) — so gating on either makes a stale
    // in-flight/failed refetch hide perfectly good cached data (REQ-006). `data` itself is the
    // only one of these that stays populated across a refetch's outcome once it has ever
    // resolved, so it is checked first, unconditionally; only entering the pending/error branches
    // when no data has EVER been received.
    let networkOptions;
    let networkDisabled = false;
    if (data !== undefined) {
        const interfaces = data.interfaces ?? [];
        if (interfaces.length > 0) {
            networkOptions = interfaces.map(({ name }) => ({ value: name, label: ucfirst(name) }));
        } else {
            networkOptions = [{ value: '', label: 'No networks found' }];
            networkDisabled = true;
        }
    } else if (isError) {
        networkOptions = [{ value: currentNetworkValue ?? '', label: 'Unable to load networks' }];
        networkDisabled = true;
    } else {
        networkOptions = [{ value: currentNetworkValue ?? '', label: 'Loading networks…' }];
        networkDisabled = true;
    }

    let encryptionOptions;
    let encryptionDisabled = false;
    if (encryptionData !== undefined) {
        const options = Array.isArray(encryptionData?.options) ? encryptionData.options : [];
        if (options.length > 0) {
            encryptionOptions = options;
        } else {
            encryptionOptions = [{ value: '', label: 'No encryption options found' }];
            encryptionDisabled = true;
        }
    } else if (encryptionIsError) {
        encryptionOptions = [{ value: encryption ?? '', label: 'Unable to load encryption options' }];
        encryptionDisabled = true;
    } else {
        encryptionOptions = [{ value: encryption ?? '', label: 'Loading encryption options…' }];
        encryptionDisabled = true;
    }

    if (mode === 'monitor') {
        return <SwitchField name={'isRecon'} label={'Recon Interface'} />;
    }

    return (
        <>
            <InputField name={'ssid'} label={'SSID'} />
            <SelectField name={'network'} label={'Network'} options={networkOptions} disabled={networkDisabled} />
            <SelectField
                name={'encryption'}
                label={'Encryption'}
                options={encryptionOptions}
                disabled={encryptionDisabled}
            />
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

ModeAwareFields.propTypes = {
    radio: PropTypes.string,
};

export default ModeAwareFields;
