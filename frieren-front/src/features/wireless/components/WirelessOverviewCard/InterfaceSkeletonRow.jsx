/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import SkeletonBar from '@src/components/SkeletonBar';

const InterfaceSkeletonRow = () => (
    <tr>
        <td><SkeletonBar width={70} /></td>
        <td><SkeletonBar width={90} /></td>
        <td><SkeletonBar width={40} /></td>
        <td><SkeletonBar width={120} /></td>
        <td><SkeletonBar width={70} /></td>
        <td><SkeletonBar width={55} /></td>
        <td><SkeletonBar width={90} /></td>
    </tr>
);

export default InterfaceSkeletonRow;
