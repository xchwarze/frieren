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
import ReadOnlyField from '@src/components/Form/ReadOnlyField';
import SelectField from '@src/components/Form/SelectField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';
import useSetInterface from '@src/features/network/hooks/useSetInterface.js';
import { PROTO_OPTIONS } from '@src/features/network/helpers/constants.js';
import { interfaceSchema } from '@src/features/network/helpers/validationSchemas.js';
import ProtoAwareFields from './ProtoAwareFields';

/**
 * Renders the interface configuration form used inside the edit modal.
 *
 * @param {String} name - The interface name being edited.
 * @param {Object} defaultValues - The initial form values.
 * @param {Function} onHide - Callback to close the modal.
 * @return {ReactElement} The InterfaceForm component.
 */
const InterfaceForm = ({ name, defaultValues, onHide }) => {
    const { mutateAsync: setInterface } = useSetInterface();

    const handleSubmit = useCallback(async (values) => {
        await setInterface({ name, ...values });
        onHide();
    }, [name, setInterface, onHide]);

    return (
        <FormProvider
            autoComplete={'off'}
            schema={interfaceSchema}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
        >
            <ReadOnlyField label={'Interface'} value={name} />
            <SelectField
                name={'proto'}
                label={'Protocol'}
                options={PROTO_OPTIONS}
            />
            <ProtoAwareFields />
            <FormActions>
                <SubmitButton label={'Save'} />
                <Button variant={'secondary'} onClick={onHide} label={'Cancel'} />
            </FormActions>
        </FormProvider>
    );
};

InterfaceForm.propTypes = {
    name: PropTypes.string.isRequired,
    defaultValues: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default InterfaceForm;
