/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import SkeletonBar from '@src/components/SkeletonBar';
import PanelTable from '@src/components/PanelTable';
import InterfaceSkeletonRow from './InterfaceSkeletonRow';

const RadioSectionSkeleton = () => (
    <div className={'mb-5'}>
        <div className={'d-flex align-items-center justify-content-between mb-2'}>
            <h6 className={'mb-0'}>
                <SkeletonBar width={200} />
            </h6>
        </div>
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
                <InterfaceSkeletonRow />
                <InterfaceSkeletonRow />
            </tbody>
        </PanelTable>
    </div>
);

const WirelessOverviewSkeleton = () => (
    <>
        <RadioSectionSkeleton />
        <RadioSectionSkeleton />
    </>
);

export default WirelessOverviewSkeleton;
