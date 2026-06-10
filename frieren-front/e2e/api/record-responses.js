import { test } from './api-fixture.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { sanitizeRecorded, trimRecorded } from '../fixtures/sanitize.js';

const OUTPUT_PATH = './e2e/fixtures/recorded-responses.json';

const ENDPOINTS = [
    ['login', 'login', { username: process.env.FRIEREN_USER || 'root', password: process.env.FRIEREN_PASS || 'root' }],
    ['header', 'serverPing'],
    ['dashboard', 'getSystemStats'],
    ['dashboard', 'getSystemResume'],
    ['dashboard', 'getNews'],
    ['system', 'getUsbDevices'],
    ['system', 'getFileSystemUsage'],
    ['system', 'getSystemLogs'],
    ['system', 'getSystemLogs', { search: 'kern' }, 'getSystemLogs:search'],
    ['system', 'getServices'],
    ['modules', 'getModuleList'],
    ['modules', 'getInstalledModules'],
    ['modules', 'getAvailableModules'],
    ['modules', 'checkDestination', { moduleName: 'test-module', moduleSize: 1024 }],
    ['packages', 'getInstalledPackages'],
    ['packages', 'getAvailablePackagesStatus'],
    ['packages', 'getInstalledPackagesStatus'],
    ['settings', 'getSectionData'],
    ['terminal', 'getStatus'],
    ['network', 'getInterfaces'],
    ['network', 'getDhcpLeases'],
    ['network', 'getStaticLeases'],
    ['network', 'getArpTable'],
    ['network', 'runPing', { host: '127.0.0.1' }],
    ['network', 'runTraceroute', { host: '127.0.0.1' }],
    ['network', 'runNslookup', { host: 'localhost' }],
    ['wireless', 'getWirelessOverview'],
    ['wireless', 'getRawWirelessConfig'],
];

test('record all API responses', async ({ api }) => {
    const recorded = {};

    for (const [module, action, params, alias] of ENDPOINTS) {
        const key = alias || action;
        const { json } = await api.post(module, action, params || {});

        if (!recorded[module]) recorded[module] = {};
        recorded[module][key] = json;
    }

    const overview = recorded.wireless?.getWirelessOverview;
    if (overview) {
        const radioNames = Object.keys(overview);
        if (radioNames.length > 0) {
            const radioName = radioNames[0];
            const radio = overview[radioName];

            const { json: radioConfig } = await api.post('wireless', 'getRadioConfig', {
                radio: radioName,
            });
            recorded.wireless.getRadioConfig = radioConfig;

            if (radio.interfaces?.[0]) {
                const { json: assocList } = await api.post('wireless', 'getAssociationList', {
                    interface: radio.interfaces[0].ifname,
                });
                recorded.wireless.getAssociationList = assocList;

                const { json: ifaceStatus } = await api.post('wireless', 'getInterfaceStatus', {
                    section: radio.interfaces[0].section,
                });
                recorded.wireless.getInterfaceStatus = ifaceStatus;
            }

            const { json: scanResult } = await api.post('wireless', 'scanForNetworks', {
                device: radioName,
            });
            recorded.wireless.scanForNetworks = scanResult;
        }
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    // Never commit real device data — scrub MACs/IPs/hostnames/SSIDs/keys,
    // then trim to a small representative sample.
    const clean = trimRecorded(sanitizeRecorded(recorded));
    writeFileSync(OUTPUT_PATH, JSON.stringify(clean, null, 2));
});
