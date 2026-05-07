/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import useGetRadioConfig from '@src/features/wireless/hooks/useGetRadioConfig.js';
import useSetRadioConfig from '@src/features/wireless/hooks/useSetRadioConfig.js';

const radioConfigSchema = yup.object({
    channel: yup.string().required('Channel is mandatory'),
    txpower: yup.string().required('TX Power is mandatory'),
    htmode: yup.string().required('Mode is mandatory'),
    country: yup.string().required('Country is mandatory'),
    disabled: yup.boolean(),
}).required();

const RadioConfigForm = ({ radio, onHide }) => {
    const { data: radioConfig, isFetching } = useGetRadioConfig(radio);
    const { mutateAsync: setRadioConfig } = useSetRadioConfig();

    const channelOptions = (radioConfig?.available?.channels ?? []).map(ch => ({
        value: String(ch.channel ?? ch),
        label: ch.channel ? `${ch.channel} (${ch.mhz} MHz)` : String(ch),
    }));

    const txpowerOptions = [
        { value: '0', label: 'Default (driver)' },
        ...(radioConfig?.available?.txpowers ?? []).map(tp => ({
            value: String(tp.dbm != null ? tp.dbm : tp),
            label: tp.dbm != null ? `${tp.dbm} dBm (${tp.mw} mW)` : String(tp),
        })),
    ];

    const htmodeOptions = (radioConfig?.available?.htmodes ?? []).map(m => ({
        value: m,
        label: m,
    }));

    const countryOptions = [
        { value: '00', label: 'Default (driver)' },
        ...(radioConfig?.available?.countries ?? []).map(c => ({
            value: c.code ?? String(c),
            label: c.code ? (c.name ? `${c.name} (${c.code})` : c.code) : String(c),
        })),
    ];

    const defaultValues = {
        channel: radioConfig?.current?.channel ?? '',
        txpower: radioConfig?.current?.txpower ?? '',
        htmode: radioConfig?.current?.htmode ?? '',
        country: radioConfig?.current?.country ?? '',
        disabled: radioConfig?.current?.disabled === '1',
    };

    const handleSubmit = useCallback(async (data) => {
        await setRadioConfig({ radio, ...data });
        onHide();
    }, [setRadioConfig, radio, onHide]);

    if (isFetching && !radioConfig) {
        return (
            <div className={'text-center py-4'}>
                <Spinner animation={'border'} size={'sm'} />
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
            <div className={'d-flex justify-content-end gap-2'}>
                <SubmitButton />
            </div>
        </FormProvider>
    );
};

RadioConfigForm.propTypes = {
    radio: PropTypes.string.isRequired,
    onHide: PropTypes.func.isRequired,
};

const RadioConfigModal = ({ show, onHide, radioName, band }) => (
    <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
            <Modal.Title>{`Radio Configuration — ${radioName} (${band || 'Unknown'})`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {show && <RadioConfigForm radio={radioName} onHide={onHide} />}
        </Modal.Body>
    </Modal>
);

RadioConfigModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    radioName: PropTypes.string,
    band: PropTypes.string,
};

export default RadioConfigModal;
