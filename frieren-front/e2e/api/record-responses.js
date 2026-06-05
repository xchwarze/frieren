import { test } from './api-fixture.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

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
    ['modules', 'getModuleList'],
    ['modules', 'getInstalledModules'],
    ['modules', 'getAvailableModules'],
    ['modules', 'checkDestination', { moduleName: 'test-module', moduleSize: 1024 }],
    ['packages', 'getInstalledPackages'],
    ['packages', 'getAvailablePackagesStatus'],
    ['packages', 'getInstalledPackagesStatus'],
    ['settings', 'getSectionData'],
    ['terminal', 'getStatus'],
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
            }

            const { json: scanResult } = await api.post('wireless', 'scanForNetworks', {
                device: radioName,
            });
            recorded.wireless.scanForNetworks = scanResult;
        }
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(recorded, null, 2));
});
