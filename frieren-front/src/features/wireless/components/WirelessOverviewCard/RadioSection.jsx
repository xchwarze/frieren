/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useCallback } from 'react';
import { Table, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useRemoveInterface from '@src/features/wireless/hooks/useRemoveInterface.js';
import useToggleInterface from '@src/features/wireless/hooks/useToggleInterface.js';

const RadioSection = ({ radioName, radio, onScan, onEdit, onAdd, onConfigure }) => {
    const { mutate: removeInterface, isPending: isRemoving } = useRemoveInterface();
    const { mutate: toggleInterface, isPending: isToggling } = useToggleInterface();

    const [confirmRemove, setConfirmRemove] = useState(null);
    const [removingSection, setRemovingSection] = useState(null);
    const [togglingSection, setTogglingSection] = useState(null);

    const isBusy = isRemoving || isToggling;

    const handleToggle = useCallback((iface) => {
        setTogglingSection(iface.section);
        toggleInterface({ section: iface.section, disabled: !iface.disabled });
    }, [toggleInterface]);

    const handleRemoveConfirmed = useCallback(() => {
        if (confirmRemove) {
            setRemovingSection(confirmRemove);
            removeInterface({ section: confirmRemove });
        }
        setConfirmRemove(null);
    }, [removeInterface, confirmRemove]);

    return (
        <div className={'mb-5'}>
            <div className={'d-flex align-items-center justify-content-between mb-2'}>
                <h6 className={'mb-0'}>
                    {radioName.toUpperCase()}
                    <Badge bg={'secondary'} className={'ms-2'}>{radio.band || 'Unknown'}</Badge>
                    <Badge bg={radio.disabled ? 'danger' : (radio.up ? 'success' : 'warning')} className={'ms-1'}>
                        {radio.disabled ? 'Disabled' : (radio.up ? 'Up' : 'Down')}
                    </Badge>
                    <small className={'text-muted ms-2'}>
                        {radio.hardware ? `${radio.hardware} | ` : ''}
                        Channel {radio.channel} | {radio.htmode}
                        {radio.hwmodes ? ` | ${radio.hwmodes}` : ''}
                    </small>
                </h6>
                <div className={'d-flex gap-1'}>
                    <Button
                        size={'sm'}
                        variant={'outline-secondary'}
                        icon={'settings'}
                        onClick={() => onConfigure(radioName, radio.band)}
                    />
                    <Button
                        size={'sm'}
                        variant={'outline-info'}
                        icon={'wifi'}
                        onClick={() => onScan(radioName)}
                    />
                    <Button
                        size={'sm'}
                        variant={'outline-success'}
                        icon={'plus'}
                        onClick={() => onAdd(radioName)}
                    />
                </div>
            </div>

            {radio.interfaces?.length > 0 ? (
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>Interface</th>
                            <th>SSID</th>
                            <th>Mode</th>
                            <th>BSSID</th>
                            <th>Encryption</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {radio.interfaces.map((iface, idx) => (
                            <tr key={idx}>
                                <td>{iface.ifname || iface.section}</td>
                                <td>{iface.ssid || '-'}</td>
                                <td>{iface.mode}</td>
                                <td><code>{iface.bssid || '-'}</code></td>
                                <td>{iface.encryption || 'None'}</td>
                                <td>
                                    <Badge bg={iface.disabled ? 'secondary' : (iface.up ? 'success' : 'danger')}>
                                        {iface.disabled ? 'Disabled' : (iface.up ? 'Up' : 'Down')}
                                    </Badge>
                                </td>
                                <td>
                                    <div className={'d-flex gap-1'}>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            icon={'edit-2'}
                                            onClick={() => onEdit(iface.section)}
                                            disabled={!iface.section || isBusy}
                                        />
                                        <Button
                                            size={'sm'}
                                            variant={iface.disabled ? 'outline-success' : 'outline-warning'}
                                            icon={iface.disabled ? 'toggle-left' : 'toggle-right'}
                                            loading={isToggling && togglingSection === iface.section}
                                            onClick={() => handleToggle(iface)}
                                            disabled={!iface.section || isBusy}
                                        />
                                        <Button
                                            size={'sm'}
                                            variant={'outline-danger'}
                                            icon={'trash-2'}
                                            onClick={() => setConfirmRemove(iface.section)}
                                            loading={isRemoving && removingSection === iface.section}
                                            disabled={!iface.section || isBusy}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className={'text-muted'}>No interfaces configured</p>
            )}

            <ConfirmationModal
                show={!!confirmRemove}
                onHide={() => setConfirmRemove(null)}
                onConfirm={handleRemoveConfirmed}
                title={'Remove Interface'}
                description={`Are you sure you want to remove interface "${confirmRemove}"? This cannot be undone.`}
                isConfirmLoading={isRemoving}
            />
        </div>
    );
};

RadioSection.propTypes = {
    radioName: PropTypes.string.isRequired,
    radio: PropTypes.object.isRequired,
    onScan: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onConfigure: PropTypes.func.isRequired,
};

export default RadioSection;
