/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { Modal, Button as BaseButton, Form, Spinner } from 'react-bootstrap';
import * as yup from 'yup';
import PropTypes from 'prop-types';

import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import useAddInterface from '@src/features/wireless/hooks/useAddInterface.js';
import useSetInterfaceConfig from '@src/features/wireless/hooks/useSetInterfaceConfig.js';
import useGetInterfaceConfig from '@src/features/wireless/hooks/useGetInterfaceConfig.js';

const MODE_OPTIONS = [
    { value: 'ap', label: 'Access Point' },
    { value: 'sta', label: 'Station' },
    { value: 'monitor', label: 'Monitor' },
];

const NETWORK_OPTIONS = [
    { value: 'lan', label: 'LAN' },
    { value: 'wwan', label: 'WWAN' },
    { value: 'guest', label: 'Guest' },
];

const ENCRYPTION_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'psk2+ccmp', label: 'WPA2-PSK' },
    { value: 'sae', label: 'WPA3-SAE' },
    { value: 'psk-mixed+ccmp', label: 'WPA/WPA2 Mixed' },
];

const normalizeEncryption = (enc) => {
    if (!enc || enc === 'none') return 'none';
    if (enc === 'psk2') return 'psk2+ccmp';
    if (enc === 'psk' || enc === 'psk-mixed') return 'psk-mixed+ccmp';
    if (enc === 'sae+ccmp') return 'sae';
    const valid = ENCRYPTION_OPTIONS.map(o => o.value);
    return valid.includes(enc) ? enc : 'none';
};

const interfaceSchema = yup.object({
    mode: yup.string().required('Mode is mandatory'),
    ssid: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('SSID is mandatory'),
    }),
    network: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('Network is mandatory'),
    }),
    encryption: yup.string().when('mode', {
        is: 'monitor',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('Encryption is mandatory'),
    }),
    key: yup.string().when(['encryption', 'mode'], {
        is: (encryption, mode) => mode !== 'monitor' && encryption && encryption !== 'none',
        then: (schema) => schema.required('Key is required').min(8, 'Min 8 characters'),
        otherwise: (schema) => schema.notRequired(),
    }),
    hidden: yup.boolean(),
    disabled: yup.boolean(),
    isManagement: yup.boolean(),
    isRecon: yup.boolean(),
});

const ModeAwareFields = ({ isEditMode }) => {
    const mode = useWatch({ name: 'mode', defaultValue: 'ap' });
    const encryption = useWatch({ name: 'encryption', defaultValue: 'none' });

    if (mode === 'monitor') {
        return !isEditMode ? <SwitchField name={'isRecon'} label={'Recon Interface'} /> : null;
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
            {mode === 'ap' && !isEditMode && (
                <SwitchField name={'isManagement'} label={'Management Interface'} />
            )}
        </>
    );
};

ModeAwareFields.propTypes = {
    isEditMode: PropTypes.bool,
};

const InterfaceForm = ({ radio, section, onHide, defaultValues }) => {
    const isEditMode = !!section;
    const { mutateAsync: addInterface } = useAddInterface();
    const { mutateAsync: setInterfaceConfig } = useSetInterfaceConfig();

    const handleSubmit = useCallback(async (values) => {
        if (isEditMode) {
            await setInterfaceConfig({ section, ...values });
        } else {
            await addInterface({ radio, ...values });
        }
        onHide();
    }, [isEditMode, section, radio, addInterface, setInterfaceConfig, onHide]);

    return (
        <FormProvider
            autoComplete={'off'}
            schema={interfaceSchema}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
        >
            <Form.Group className={'mb-3'}>
                <Form.Label>{isEditMode ? 'Section' : 'Radio'}</Form.Label>
                <Form.Control
                    value={isEditMode ? section : radio}
                    disabled
                    readOnly
                />
            </Form.Group>
            <SelectField
                name={'mode'}
                label={'Mode'}
                options={MODE_OPTIONS}
            />
            <ModeAwareFields isEditMode={isEditMode} />
            <SwitchField
                name={'disabled'}
                label={'Disabled'}
            />
            <div className={'d-flex justify-content-end gap-2'}>
                <SubmitButton label={isEditMode ? 'Save' : 'Add Interface'} />
                <BaseButton variant={'secondary'} onClick={onHide}>
                    Cancel
                </BaseButton>
            </div>
        </FormProvider>
    );
};

InterfaceForm.propTypes = {
    radio: PropTypes.string,
    section: PropTypes.string,
    onHide: PropTypes.func.isRequired,
    defaultValues: PropTypes.object.isRequired,
};

const ADD_DEFAULTS = {
    ssid: '',
    mode: 'ap',
    network: 'lan',
    encryption: 'none',
    key: '',
    hidden: false,
    disabled: false,
    isManagement: false,
    isRecon: false,
};

const InterfaceFormLoader = ({ radio, section, onHide, initialValues }) => {
    const { data: interfaceConfig, isFetching } = useGetInterfaceConfig(section);

    if (isFetching) {
        return (
            <div className={'text-center py-3'}>
                <Spinner animation={'border'} size={'sm'} />
            </div>
        );
    }

    const defaultValues = section
        ? {
            ssid: interfaceConfig?.ssid ?? '',
            mode: interfaceConfig?.mode ?? 'ap',
            network: interfaceConfig?.network ?? 'lan',
            encryption: normalizeEncryption(interfaceConfig?.encryption),
            key: interfaceConfig?.key ?? '',
            hidden: interfaceConfig?.hidden === '1',
            disabled: interfaceConfig?.disabled === '1',
        }
        : (initialValues || ADD_DEFAULTS);

    return (
        <InterfaceForm
            radio={radio}
            section={section}
            onHide={onHide}
            defaultValues={defaultValues}
        />
    );
};

InterfaceFormLoader.propTypes = {
    radio: PropTypes.string,
    section: PropTypes.string,
    onHide: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
};

const InterfaceFormModal = ({ show, onHide, radio, section, initialValues }) => {
    const isEditMode = !!section;
    const title = isEditMode ? 'Edit Interface' : 'Add Interface';

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {show && (
                    <InterfaceFormLoader
                        radio={radio}
                        section={section}
                        onHide={onHide}
                        initialValues={initialValues}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

InterfaceFormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    radio: PropTypes.string,
    section: PropTypes.string,
    initialValues: PropTypes.object,
};

export default InterfaceFormModal;
