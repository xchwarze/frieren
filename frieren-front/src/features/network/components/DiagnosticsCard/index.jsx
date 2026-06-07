/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import PanelCard from '@src/components/PanelCard';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import Button from '@src/components/Button';
import useRunPing from '@src/features/network/hooks/useRunPing.js';
import useRunTraceroute from '@src/features/network/hooks/useRunTraceroute.js';
import useRunNslookup from '@src/features/network/hooks/useRunNslookup.js';
import useGetArpTable from '@src/features/network/hooks/useGetArpTable.js';

/**
 * Renders network diagnostics tools (ping/traceroute/nslookup) and the ARP table.
 *
 * @return {ReactElement} The DiagnosticsCard component.
 */
const DiagnosticsCard = () => {
    const arpQuery = useGetArpTable();
    const ping = useRunPing();
    const traceroute = useRunTraceroute();
    const nslookup = useRunNslookup();

    const [host, setHost] = useState('');
    const [output, setOutput] = useState('');

    const neighbors = arpQuery?.data?.neighbors ?? [];
    const isRunning = ping.isPending || traceroute.isPending || nslookup.isPending;
    const canRun = host.trim().length > 0 && !isRunning;

    const runTool = async (mutation) => {
        try {
            const result = await mutation.mutateAsync({ host: host.trim() });
            setOutput(result?.output ?? '');
        } catch {
            setOutput('Command failed.');
        }
    };

    const renderArpTable = () => {
        if (!arpQuery.isSuccess) {
            return (
                <SkeletonTable
                    headers={['IP', 'MAC', 'Device', 'State']}
                    widths={[120, 160, 90, 90]}
                />
            );
        }

        return (
            <Table striped hover responsive>
                <thead>
                    <tr>
                        <th>IP</th>
                        <th>MAC</th>
                        <th>Device</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>
                    {neighbors.map((neighbor) => (
                        <tr key={`${neighbor.ip}-${neighbor.mac}`}>
                            <td>{neighbor.ip}</td>
                            <td><code>{neighbor.mac}</code></td>
                            <td>{neighbor.device || '-'}</td>
                            <td>{neighbor.state || '-'}</td>
                        </tr>
                    ))}
                    {neighbors.length === 0 && (
                        <tr>
                            <td colSpan={4}>No neighbors found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    };

    return (
        <div className={'d-flex flex-column gap-4'}>
            <PanelCard
                title={'Diagnostics'}
                subtitle={'Run network reachability and name resolution tools'}
                showRefresh={false}
            >
                <Form.Group className={'mb-3'}>
                    <Form.Label htmlFor={'diagnostics-host'}>Host</Form.Label>
                    <Form.Control
                        id={'diagnostics-host'}
                        placeholder={'example.com or 192.168.1.1'}
                        value={host}
                        onChange={(event) => setHost(event.target.value)}
                    />
                </Form.Group>

                <div className={'d-flex gap-2 mb-3'}>
                    <Button
                        label={'Ping'}
                        icon={'activity'}
                        disabled={!canRun}
                        loading={ping.isPending}
                        onClick={() => runTool(ping)}
                    />
                    <Button
                        label={'Traceroute'}
                        icon={'share-2'}
                        variant={'secondary'}
                        disabled={!canRun}
                        loading={traceroute.isPending}
                        onClick={() => runTool(traceroute)}
                    />
                    <Button
                        label={'Nslookup'}
                        icon={'server'}
                        variant={'secondary'}
                        disabled={!canRun}
                        loading={nslookup.isPending}
                        onClick={() => runTool(nslookup)}
                    />
                </div>

                <Form.Group>
                    <Form.Label htmlFor={'diagnostics-output'}>Output</Form.Label>
                    <Form.Control
                        id={'diagnostics-output'}
                        as={'textarea'}
                        rows={10}
                        readOnly={true}
                        value={output || 'No output yet.'}
                        className={'text-body-secondary font-monospace'}
                    />
                </Form.Group>
            </PanelCard>

            <PanelCard
                title={'ARP Table'}
                subtitle={'Discovered neighbors'}
                refetch={arpQuery.refetch}
                isFetching={arpQuery.isFetching}
            >
                {renderArpTable()}
            </PanelCard>
        </div>
    );
};

export default DiagnosticsCard;
