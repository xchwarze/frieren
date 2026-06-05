/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Form from 'react-bootstrap/Form';

import useDiagnosticsStatus from '@src/features/system/hooks/useDiagnosticsStatus.js';
import useStartDiagnosticsScript from '@src/features/system/hooks/useStartDiagnosticsScript.js';
import useDownloadDiagnosticsFile from '@src/features/system/hooks/useDownloadDiagnosticsFile.js';
import PanelCard from '@src/components/PanelCard';
import SkeletonBar from '@src/components/SkeletonBar';
import Button from '@src/components/Button';

/**
 * Renders a Diagnostics card component with information and actions related to system diagnostics.
 *
 * @return {ReactElement} The Diagnostics Card component
 */
const DiagnosticsCard = () => {
    const query = useDiagnosticsStatus();
    const { mutate: startDiagnostics, isPending: startDiagnosticsRunning, isPolling } = useStartDiagnosticsScript();
    const { mutate: downloadDiagnostics, isPending: downloadDiagnosticsRunning } = useDownloadDiagnosticsFile();

    const { status, completed } = query?.data ?? {};
    const resume = status ? status : 'There are no reports generated.';

    const renderContent = () => {
        if (query.isLoading) {
            return (
                <>
                    <div className={'mb-3'}>
                        <SkeletonBar width={400} height={120} barHeight={116} />
                    </div>
                    <div className={'d-flex justify-content-end gap-2'}>
                        <SkeletonBar width={140} height={38} barHeight={34} />
                        <SkeletonBar width={110} height={38} barHeight={34} />
                    </div>
                </>
            );
        }

        return (
            <>
                <Form.Group className={'mb-3'}>
                    <Form.Control
                        as={'textarea'}
                        rows={6}
                        readOnly={true}
                        value={resume}
                        className={'text-muted'}
                    />
                </Form.Group>
                <div className={'d-flex justify-content-end gap-2'}>
                    <Button
                        label={'Generate Report'}
                        icon={'play'}
                        loading={startDiagnosticsRunning || isPolling}
                        onClick={startDiagnostics}
                    />
                    <Button
                        label={'Download'}
                        icon={'download'}
                        variant={'secondary'}
                        disabled={!completed}
                        loading={downloadDiagnosticsRunning}
                        onClick={downloadDiagnostics}
                    />
                </div>
            </>
        );
    };

    return (
        <PanelCard
            title={'Diagnostics'}
            subtitle={'Comprehensive system analysis covering logs, configurations, and vital stats for ' +
                'troubleshooting and performance assessment.'}
            showRefresh={false}
            className={'mt-4'}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default DiagnosticsCard;
