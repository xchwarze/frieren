/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import ReadOnlyField from '@src/components/Form/ReadOnlyField';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';
import useAddInterface from '@src/features/network/hooks/useAddInterface.js';
import useSetInterface from '@src/features/network/hooks/useSetInterface.js';
import { PROTO_OPTIONS } from '@src/features/network/helpers/constants.js';
import { interfaceSchema } from '@src/features/network/helpers/validationSchemas.js';
import ProtoAwareFields from './ProtoAwareFields';
import DeviceField from './DeviceField';

/**
 * Renders the interface configuration form used inside the add/edit modal.
 *
 * In edit mode the name is read-only and never registered as an input, but it still
 * round-trips through submit: FormProvider's useForm keeps every `defaultValues` key
 * (here, `name`) in its internal state regardless of whether an input for it is ever
 * registered, so `values.name` in handleSubmit is the original name seeded via
 * `defaultValues.name` by InterfaceFormModal.
 *
 * @param {Boolean} isEditMode - Whether an existing interface is being edited (vs. created).
 * @param {Object} defaultValues - The initial form values, including `name`.
 * @param {Function} onHide - Callback to close the modal.
 * @return {ReactElement} The InterfaceForm component.
 */
const InterfaceForm = ({ isEditMode, defaultValues, onHide }) => {
    const { mutateAsync: addInterface } = useAddInterface();
    const { mutateAsync: setInterface } = useSetInterface();

    const handleSubmit = useCallback(async (values) => {
        if (isEditMode) {
            await setInterface(values);
        } else {
            await addInterface(values);
        }
        onHide();
    }, [isEditMode, addInterface, setInterface, onHide]);

    return (
        <FormProvider
            autoComplete={'off'}
            schema={interfaceSchema}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
        >
            {isEditMode
                ? <ReadOnlyField label={'Interface'} value={defaultValues.name} />
                : <InputField name={'name'} label={'Interface Name'} placeholder={'e.g. guest'} />}
            {!isEditMode && <DeviceField />}
            <SelectField
                name={'proto'}
                label={'Protocol'}
                options={PROTO_OPTIONS}
            />
            <ProtoAwareFields />
            <InputField name={'mtu'} label={'MTU'} type={'number'} placeholder={'1500'} />
            <InputField name={'macaddr'} label={'MAC Address'} placeholder={'Leave empty for hardware default'} />
            <SwitchField name={'peerdns'} label={'Use DNS from protocol'} />
            <FormActions>
                <SubmitButton label={'Save'} />
                <Button variant={'secondary'} onClick={onHide} label={'Cancel'} />
            </FormActions>
        </FormProvider>
    );
};

InterfaceForm.propTypes = {
    isEditMode: PropTypes.bool.isRequired,
    defaultValues: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default InterfaceForm;
