/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import Loading from '@src/components/Loading';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';
import { radioConfigSchema } from '@src/features/wireless/helpers/validationSchemas.js';
import useGetRadioConfig from '@src/features/wireless/hooks/useGetRadioConfig.js';
import useSetRadioConfig from '@src/features/wireless/hooks/useSetRadioConfig.js';

const RadioConfigForm = ({ radio, onHide }) => {
    const { data: radioConfig, isFetching } = useGetRadioConfig(radio);
    const { mutateAsync: setRadioConfig } = useSetRadioConfig();

    const channelOptions = (radioConfig?.available?.channels ?? []).map(channel => ({
        value: String(channel.channel ?? channel),
        label: channel.channel ? `${channel.channel} (${channel.mhz} MHz)` : String(channel),
    }));

    const txpowerOptions = [
        { value: '0', label: 'Default (driver)' },
        ...(radioConfig?.available?.txpowers ?? []).map(txpower => ({
            value: String(txpower.dbm != null ? txpower.dbm : txpower),
            label: txpower.dbm != null ? `${txpower.dbm} dBm (${txpower.mw} mW)` : String(txpower),
        })),
    ];

    const htmodeOptions = (radioConfig?.available?.htmodes ?? []).map(mode => ({
        value: mode,
        label: mode,
    }));

    const countryOptions = [
        { value: '00', label: 'Default (driver)' },
        ...(radioConfig?.available?.countries ?? []).map(country => ({
            value: country.code ?? String(country),
            label: country.code ? (country.name ? `${country.name} (${country.code})` : country.code) : String(country),
        })),
    ];

    const defaultValues = {
        channel: radioConfig?.current?.channel ?? '',
        txpower: radioConfig?.current?.txpower ?? '',
        htmode: radioConfig?.current?.htmode ?? '',
        country: radioConfig?.current?.country ?? '',
        disabled: radioConfig?.current?.disabled === '1',
    };

    const handleSubmit = useCallback(async (values) => {
        await setRadioConfig({ radio, ...values });
        onHide();
    }, [setRadioConfig, radio, onHide]);

    if (isFetching && !radioConfig) {
        return (
            <div className={'text-center py-4'}>
                <Loading size={96} />
            </div>
        );
    }

    return (
        <FormProvider schema={radioConfigSchema} onSubmit={handleSubmit} defaultValues={defaultValues}>
            <SelectField name={'channel'} label={'Channel'} options={channelOptions} />
            <SelectField name={'txpower'} label={'TX Power'} options={txpowerOptions} />
            <SelectField name={'htmode'} label={'Mode / Bandwidth'} options={htmodeOptions} />
            <SelectField name={'country'} label={'Country'} options={countryOptions} />
            <SwitchField name={'disabled'} label={'Disabled'} />
            <FormActions>
                <SubmitButton />
                <Button variant={'secondary'} onClick={onHide} label={'Cancel'} />
            </FormActions>
        </FormProvider>
    );
};

RadioConfigForm.propTypes = {
    radio: PropTypes.string.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default RadioConfigForm;
