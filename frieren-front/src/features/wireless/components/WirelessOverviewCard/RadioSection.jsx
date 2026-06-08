/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useCallback } from 'react';
import { Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import StatusBadge from '@src/components/StatusBadge';
import ActionButtons from '@src/components/ActionButtons';
import PanelTable from '@src/components/PanelTable';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useRemoveInterface from '@src/features/wireless/hooks/useRemoveInterface.js';
import useToggleInterface from '@src/features/wireless/hooks/useToggleInterface.js';
import InterfaceSkeletonRow from './InterfaceSkeletonRow';

const RadioSection = ({ radioName, radio, onScan, onEdit, onAdd, onConfigure, checkingSection, checkingRadio }) => {
    const { mutate: removeInterface, isPending: isRemoving } = useRemoveInterface();
    const { mutate: toggleInterface, isPending: isToggling } = useToggleInterface();

    const [confirmRemove, setConfirmRemove] = useState(null);
    const [removingSection, setRemovingSection] = useState(null);
    const [togglingSection, setTogglingSection] = useState(null);

    const isBusy = isRemoving || isToggling;
    const isCheckingRadio = checkingRadio === radioName;
    const existingMatch = isCheckingRadio && radio.interfaces?.some((iface) => iface.section === checkingSection);
    const hasNewInterface = isCheckingRadio && checkingSection && !existingMatch;

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
        <div className={'mb-4'}>
            <div className={'d-flex align-items-center justify-content-between mb-2'}>
                <h6 className={'mb-0'}>
                    {radioName.toUpperCase()}
                    <Badge bg={'secondary'} className={'ms-2'}>{radio.band || 'Unknown'}</Badge>
                    <StatusBadge status={radio.disabled ? 'disabled' : (radio.up ? 'up' : 'degraded')} className={'ms-1'}>
                        {radio.disabled ? 'Disabled' : (radio.up ? 'Up' : 'Down')}
                    </StatusBadge>
                    <small className={'text-body-secondary ms-2'}>
                        {radio.hardware ? `${radio.hardware} | ` : ''}
                        Channel {radio.channel} | {radio.htmode}
                        {radio.hwmodes ? ` | ${radio.hwmodes}` : ''}
                    </small>
                </h6>
                <ActionButtons>
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
                </ActionButtons>
            </div>

            {radio.interfaces?.length > 0 || hasNewInterface ? (
                <PanelTable>
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
                        {radio.interfaces?.map((iface) => (
                            isCheckingRadio && checkingSection === iface.section ? (
                                <InterfaceSkeletonRow key={iface.section} />
                            ) : (
                                <tr key={iface.section}>
                                    <td>{iface.ifname || iface.section}</td>
                                    <td>{iface.ssid || '-'}</td>
                                    <td>{iface.mode}</td>
                                    <td><code>{iface.bssid || '-'}</code></td>
                                    <td>{iface.encryption || 'None'}</td>
                                    <td>
                                        <StatusBadge status={iface.disabled ? 'disabled' : (iface.up ? 'up' : 'degraded')}>
                                            {iface.disabled ? 'Disabled' : (iface.up ? 'Up' : 'Down')}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <ActionButtons>
                                            <Button
                                                size={'sm'}
                                                variant={'outline-primary'}
                                                icon={'edit-2'}
                                                onClick={() => onEdit(iface.section, radioName)}
                                                disabled={!iface.section || isBusy}
                                            />
                                            <Button
                                                size={'sm'}
                                                variant={iface.disabled ? 'outline-success' : 'outline-danger'}
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
                                        </ActionButtons>
                                    </td>
                                </tr>
                            )
                        ))}
                        {hasNewInterface && <InterfaceSkeletonRow />}
                    </tbody>
                </PanelTable>
            ) : (
                <p className={'text-body-secondary'}>No interfaces configured</p>
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
    checkingSection: PropTypes.string,
    checkingRadio: PropTypes.string,
};

export default RadioSection;
