import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import useGetSectionData from '@src/features/settings/hooks/useGetSectionData.js';
import TimezoneCard from '@src/features/settings/components/TimezoneCard';
import HostnameCard from '@src/features/settings/components/HostnameCard';
import UpdateUserPasswordCard from '@src/features/settings/components/UpdateUserPasswordCard';
import PanelThemeCard from '@src/features/settings/components/PanelThemeCard';

/**
 * Generates the Settings component with various cards for managing user settings.
 *
 * @return {ReactElement} The rendered Settings component
 */
const Settings = () => {
    const query = useGetSectionData();

    return (
        <>
            <Row className={'g-3'}>
                <Col md={6}>
                    <TimezoneCard query={query} />
                </Col>
                <Col md={6}>
                    <HostnameCard query={query} />
                </Col>
            </Row>
            <Row className={'g-3'}>
                <Col md={6}>
                    <PanelThemeCard query={query} />
                </Col>
                <Col md={6}>
                    <UpdateUserPasswordCard />
                </Col>
            </Row>
        </>
    );
}

export default Settings;
