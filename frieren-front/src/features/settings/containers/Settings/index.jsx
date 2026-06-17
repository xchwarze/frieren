/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import useGetSectionData from '@src/features/settings/hooks/useGetSectionData.js';
import TimezoneCard from '@src/features/settings/components/TimezoneCard';
import HostnameCard from '@src/features/settings/components/HostnameCard';
import UpdateUserPasswordCard from '@src/features/settings/components/UpdateUserPasswordCard';
import PanelThemeCard from '@src/features/settings/components/PanelThemeCard';
import TerminalSettingsCard from '@src/features/settings/components/TerminalSettingsCard';

/**
 * Generates the Settings component with various cards for managing user settings.
 *
 * @return {ReactElement} The rendered Settings component
 */
const Settings = () => {
    const query = useGetSectionData();

    return (
        <Row className={'g-3'}>
            <Col md={6}>
                <TimezoneCard query={query} />
            </Col>
            <Col md={6}>
                <HostnameCard query={query} />
            </Col>
            <Col md={6}>
                <TerminalSettingsCard query={query} />
            </Col>
            <Col md={6}>
                <UpdateUserPasswordCard />
            </Col>
            <Col md={6}>
                <PanelThemeCard query={query} />
            </Col>
        </Row>
    );
}

export default Settings;
