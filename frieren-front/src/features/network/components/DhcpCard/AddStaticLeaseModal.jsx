/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';
import useAddStaticLease from '@src/features/network/hooks/useAddStaticLease.js';
import { staticLeaseSchema } from '@src/features/network/helpers/validationSchemas.js';

const DEFAULT_VALUES = { name: '', mac: '', ip: '' };

/**
 * Modal with an inline form to add a static DHCP lease.
 *
 * @param {Boolean} show - Whether the modal is visible.
 * @param {Function} onHide - Callback to close the modal.
 * @return {ReactElement} The AddStaticLeaseModal component.
 */
const AddStaticLeaseModal = ({ show, onHide }) => {
    const { mutateAsync: addStaticLease } = useAddStaticLease();

    const handleSubmit = useCallback(async (values) => {
        await addStaticLease(values);
        onHide();
    }, [addStaticLease, onHide]);

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Static Lease</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {show && (
                    <FormProvider
                        autoComplete={'off'}
                        schema={staticLeaseSchema}
                        onSubmit={handleSubmit}
                        defaultValues={DEFAULT_VALUES}
                    >
                        <InputField name={'name'} label={'Name'} placeholder={'my-device'} />
                        <InputField name={'mac'} label={'MAC Address'} placeholder={'00:11:22:33:44:55'} />
                        <InputField name={'ip'} label={'IP Address'} placeholder={'192.168.1.50'} />
                        <FormActions>
                            <SubmitButton label={'Add'} icon={'plus'} />
                            <Button variant={'secondary'} onClick={onHide} label={'Cancel'} />
                        </FormActions>
                    </FormProvider>
                )}
            </Modal.Body>
        </Modal>
    );
};

AddStaticLeaseModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default AddStaticLeaseModal;
