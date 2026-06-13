/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

import { MODULE_INSTALL_TYPE_INTERNAL, MODULE_INSTALL_TYPE_SD } from '@src/features/modules/helpers/constants.js';
import useInstallModuleDependencies from '@src/hooks/useInstallModuleDependencies.js';
import Button from '@src/components/Button';
import Loading from '@src/components/Loading';

/**
 * Render an alert for missing required dependencies.
 *
 * @param {string} module - The current module name
 * @param {string} dependenciesQueryKey - The query key for re fetching dependencies status
 * @param {boolean} show - Flag to determine if the alert should be shown
 * @param {string} message - The message to display in the alert
 * @param {boolean} internalAvailable - Flag indicating if internal installation is available
 * @param {boolean} SDAvailable - Flag indicating if SD card installation is available
 * @return {ReactElement} The rendered DependenciesAlert component
 */
const DependenciesAlert = ({ module, dependenciesQueryKey, show, message, internalAvailable, SDAvailable }) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [showLog, setShowLog] = useState(false);
    const logRef = useRef(null);
    const { install, isPolling, isPending, output, installFailed } =
        useInstallModuleDependencies({ module, dependenciesQueryKey });
    const isLoading = isPending || isPolling;

    const showLogPanel = showLog || installFailed;

    useEffect(() => {
        if (showLogPanel && logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [output, showLogPanel]);

    const handleInstallToSDClick = useCallback(() => {
        setSelectedOption(MODULE_INSTALL_TYPE_SD);
        install({ destination: MODULE_INSTALL_TYPE_SD });
    }, [install, setSelectedOption]);

    const handleInstallInternallyClick = useCallback(() => {
        setSelectedOption(MODULE_INSTALL_TYPE_INTERNAL);
        install({ destination: MODULE_INSTALL_TYPE_INTERNAL });
    }, [install, setSelectedOption]);

    return (
        <Alert show={show} variant={'dark'}>
            <Alert.Heading>
                Required dependencies
            </Alert.Heading>
            {!isLoading && !installFailed && (
                <>
                    <p>
                        The required dependencies for this module were not found.
                    </p>
                    {message && (
                        <p>
                            {message}
                        </p>
                    )}
                </>
            )}
            {isLoading && !showLog && (
                <div className={'text-center'}>
                    <Loading size={96} />
                </div>
            )}
            {installFailed && (
                <p>
                    The installation process is completed, but the dependencies are not detected.
                </p>
            )}
            {showLogPanel && (
                <Form.Control
                    as={'textarea'}
                    ref={logRef}
                    value={output || 'Waiting for installation output…'}
                    readOnly
                    rows={7}
                    className={'mt-2 font-monospace small'}
                />
            )}
            <hr />
            <div className={'d-flex justify-content-between align-items-center gap-2'}>
                <div>
                    {(isLoading || installFailed) && (
                        <Form.Check
                            type={'switch'}
                            label={'Show installation status'}
                            checked={showLog}
                            onChange={() => setShowLog(prev => !prev)}
                        />
                    )}
                </div>
                <div className={'d-flex gap-2'}>
                    {SDAvailable && (
                        <Button
                            label={'Install to SD Card'}
                            icon={'moon'}
                            variant={'outline-primary'}
                            disabled={isLoading && selectedOption === MODULE_INSTALL_TYPE_INTERNAL}
                            loading={isLoading && selectedOption === MODULE_INSTALL_TYPE_SD}
                            onClick={handleInstallToSDClick}
                        />
                    )}
                    <Button
                        label={'Install Internally'}
                        icon={'hard-drive'}
                        variant={'outline-primary'}
                        disabled={!internalAvailable || isLoading && selectedOption === MODULE_INSTALL_TYPE_SD}
                        loading={isLoading && selectedOption === MODULE_INSTALL_TYPE_INTERNAL}
                        onClick={handleInstallInternallyClick}
                    />
                </div>
            </div>
        </Alert>
    );
};

DependenciesAlert.propTypes = {
    module: PropTypes.string.isRequired,
    dependenciesQueryKey: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    internalAvailable: PropTypes.bool,
    SDAvailable: PropTypes.bool,
    message: PropTypes.string,
};

export default DependenciesAlert;
