/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { Button as BaseButton, Form } from 'react-bootstrap';
import * as yup from 'yup';
import PropTypes from 'prop-types';

import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import useAddInterface from '@src/features/wireless/hooks/useAddInterface.js';
import useSetInterfaceConfig from '@src/features/wireless/hooks/useSetInterfaceConfig.js';
import ModeAwareFields from './ModeAwareFields';

const MODE_OPTIONS = [
    { value: 'ap', label: 'Access Point' },
    { value: 'sta', label: 'Station' },
    { value: 'monitor', label: 'Monitor' },
];

export const interfaceSchema = yup.object({
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
            <ModeAwareFields />
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

export default InterfaceForm;
