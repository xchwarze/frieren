import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useSystemResume from '@src/features/dashboard/hooks/useSystemResume.js';

/**
 * Generate a System Information card displaying hostname, model, architecture, target platform, firmware version, and kernel version.
 *
 * @return {ReactElement} The System Information card component
 */
const SystemInfoCard = () => {
    const query = useSystemResume();
    const { data, isSuccess } = query;

    return (
        <PanelCard
            title={'System Information'}
            query={query}
            showRefresh={false}
        >
            {isSuccess && (
                <Table className={'mt-4'} striped hover responsive>
                    <tbody>
                    <tr>
                        <td>Hostname</td>
                        <td>{data.hostname}</td>
                    </tr>
                    <tr>
                        <td>Model</td>
                        <td>{data.model}</td>
                    </tr>
                    <tr>
                        <td>Architecture</td>
                        <td>{data.system}</td>
                    </tr>
                    <tr>
                        <td>Target Platform</td>
                        <td>{data.release.target}</td>
                    </tr>
                    <tr>
                        <td>Firmware Version</td>
                        <td>{`${data.release.distribution} ${data.release.version} ${data.release.revision}`}</td>
                    </tr>
                    <tr>
                        <td>Kernel Version</td>
                        <td>{data.kernel}</td>
                    </tr>
                    </tbody>
                </Table>
            )}
        </PanelCard>
    );
};

export default SystemInfoCard;
