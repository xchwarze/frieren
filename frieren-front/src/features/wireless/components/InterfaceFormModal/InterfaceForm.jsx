/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { Button as BaseButton, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import { MODE_OPTIONS } from '@src/features/wireless/helpers/constants.js';
import { interfaceSchema } from '@src/features/wireless/helpers/validationSchemas.js';
import useAddInterface from '@src/features/wireless/hooks/useAddInterface.js';
import useSetInterfaceConfig from '@src/features/wireless/hooks/useSetInterfaceConfig.js';
import ModeAwareFields from './ModeAwareFields';

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
