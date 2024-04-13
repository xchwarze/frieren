/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import Form from 'react-bootstrap/Form';
import { useAtomValue } from 'jotai';

import isPollingActiveAtom from '@src/features/hardware/atoms/isPollingActiveAtom.js';
import useDiagnosticsStatus from '@src/features/hardware/hooks/useDiagnosticsStatus.js';
import useStartDiagnosticsScript from '@src/features/hardware/hooks/useStartDiagnosticsScript.js';
import useDownloadDiagnosticsFile from '@src/features/hardware/hooks/useDownloadDiagnosticsFile.js';
import PanelCard from '@src/components/PanelCard';
import Button from '@src/components/Button';

/**
 * Renders a Diagnostics card component with information and actions related to system diagnostics.
 *
 * @return {ReactElement} The Diagnostics Card component
 */
const DiagnosticsCard = () => {
    const query = useDiagnosticsStatus();
    const { mutate: startDiagnostics, isPending: startDiagnosticsRunning } = useStartDiagnosticsScript();
    const { mutate: downloadDiagnostics, isPending: downloadDiagnosticsRunning } = useDownloadDiagnosticsFile();
    const isPollingActive = useAtomValue(isPollingActiveAtom);

    const { status, completed } = query?.data ?? {};
    const resume = status ? status : 'There are no reports generated.';

    return (
        <PanelCard
            title={'Diagnostics'}
            subtitle={'Comprehensive system analysis covering logs, configurations, and vital stats for ' +
                'troubleshooting and performance assessment.'}
            query={query}
        >
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
                    loading={startDiagnosticsRunning || isPollingActive}
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
        </PanelCard>
    );
};

export default DiagnosticsCard;
