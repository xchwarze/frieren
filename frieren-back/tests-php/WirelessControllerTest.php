<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `wireless` module (radio config, wifi-iface management,
 * scanning, association lists, and raw UCI config editing).
 *
 * Mocking notes:
 *  - Almost everything bottoms out in OpenWrtHelper::execUbusCall()/exec(), which
 *    make an unqualified `exec()` call resolved in the `frieren\helper` namespace
 *    (same pattern as NetworkControllerTest/SystemControllerTest). A single
 *    `exec` mock with a command-inspecting callback is used whenever an action
 *    fires more than one exec()/ubus call, since consecutive-call ordering is an
 *    implementation detail we don't want to pin down here.
 *  - `OpenWrtHelper::uciGet()`/`uciSet()`/`uciCommit()` delegate to
 *    UciConfigHelper, which is ALSO in the `frieren\helper` namespace and calls
 *    the raw `exec("uci ...")` CLI directly (not through OpenWrtHelper::exec()),
 *    so these are intercepted by the very same `frieren\helper` `exec` mock.
 *  - `getRawWirelessConfig`/`setRawWirelessConfig` read/write
 *    `/etc/config/wireless` via unqualified `file_get_contents()`/
 *    `file_put_contents()`, written inside this module's own
 *    `ModuleOpenWrtHelper` (namespace `frieren\modules\wireless`) — those are
 *    intercepted in this test's own namespace instead (same pattern as
 *    NetworkControllerTest's getDhcpLeases()).
 *  - Several actions (setRadioConfig/addInterface/removeInterface/
 *    toggleInterface/setInterfaceConfig) validate an existing UCI section first
 *    via `uciGet(..., false)` and throw a plain `\Exception` when it's missing.
 *    Controller::handleActions() does not catch this, so it propagates out of
 *    dispatch() — verified here with expectException().
 *  - Deeply-chained actions (getWirelessOverview, getRadioConfig) are covered
 *    with one happy-path test each, built directly against the recorded device
 *    contract shapes from frieren-front/CLAUDE.md rather than exhaustively
 *    covering every internal branch (empty ubus results, disabled radios, etc.).
 */

namespace frieren\modules\wireless;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class WirelessControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    // -----------------------------------------------------------------
    // scanForNetworks
    // -----------------------------------------------------------------

    public function testScanForNetworksReturnsApListWithComputedSecurityAndFiltersUnknownSsids(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'results' => [
                    [
                        'bssid' => '02:00:00:00:00:01',
                        'ssid' => 'ExampleNet',
                        'channel' => 8,
                        'signal' => -28,
                        'quality' => 70,
                        'encryption' => [
                            'enabled' => true,
                            'wpa' => [2],
                            'authentication' => ['psk'],
                            'ciphers' => ['ccmp'],
                        ],
                    ],
                    // Must be filtered out: iwinfo reports 'unknown' for hidden/garbled SSIDs.
                    ['bssid' => '02:00:00:00:00:02', 'ssid' => 'unknown', 'channel' => 1, 'signal' => -80, 'quality' => 10, 'encryption' => ['enabled' => false]],
                ],
            ])];
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'scanForNetworks',
            'device' => 'radio0',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            [
                'bssid' => '02:00:00:00:00:01',
                'ssid' => 'ExampleNet',
                'channel' => 8,
                'signal' => -28,
                'quality' => 70,
                'security' => 'WPA2-PSK / CCMP',
            ],
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // getEncryptionOptions
    // -----------------------------------------------------------------

    public function testGetEncryptionOptionsUsesHostapdFeaturesForApMode(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];

            if (str_contains($command, "uci -q get 'wireless.radio0'")) {
                return 'wifi-device';
            }

            if (str_contains($command, "'luci' 'getFeatures'")) {
                $output = [json_encode([
                    'hostapd' => ['sae' => true],
                    'wpasupplicant' => ['sae' => false],
                ])];
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getEncryptionOptions',
            'radio' => 'radio0',
            'mode' => 'ap',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'options' => [
                ['value' => 'none', 'label' => 'None'],
                ['value' => 'psk2+ccmp', 'label' => 'WPA2-PSK'],
                ['value' => 'psk-mixed+ccmp', 'label' => 'WPA/WPA2 Mixed'],
                ['value' => 'sae', 'label' => 'WPA3-SAE'],
            ],
        ], $result['data']);
    }

    public function testGetEncryptionOptionsUsesWpaSupplicantFeaturesForStaMode(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];

            if (str_contains($command, "uci -q get 'wireless.radio0'")) {
                return 'wifi-device';
            }

            if (str_contains($command, "'luci' 'getFeatures'")) {
                $output = [json_encode([
                    'hostapd' => ['sae' => true],
                    'wpasupplicant' => ['sae' => false],
                ])];
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getEncryptionOptions',
            'radio' => 'radio0',
            'mode' => 'sta',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'options' => [
                ['value' => 'none', 'label' => 'None'],
                ['value' => 'psk2+ccmp', 'label' => 'WPA2-PSK'],
                ['value' => 'psk-mixed+ccmp', 'label' => 'WPA/WPA2 Mixed'],
            ],
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // getWirelessOverview
    // -----------------------------------------------------------------

    public function testGetWirelessOverviewMergesUciAndUbusDataForARadioAndItsInterface(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode([
                    'values' => [
                        'radio0' => [
                            '.type' => 'wifi-device',
                            '.name' => 'radio0',
                            'channel' => '8',
                            'htmode' => 'HT20',
                            'disabled' => '0',
                        ],
                        'wifinet2' => [
                            '.type' => 'wifi-iface',
                            '.name' => 'wifinet2',
                            'device' => 'radio0',
                            'mode' => 'sta',
                            'ssid' => 'ExampleNet',
                            'encryption' => 'psk2+ccmp',
                            'network' => 'wwan',
                            'hidden' => '0',
                            'disabled' => '0',
                        ],
                    ],
                ])];
            } elseif (str_contains($command, "'network.wireless' 'status'")) {
                $output = [json_encode([
                    'radio0' => [
                        'up' => true,
                        'interfaces' => [
                            ['section' => 'wifinet2', 'ifname' => 'phy0-sta0'],
                        ],
                    ],
                ])];
            } elseif (str_contains($command, "'luci-rpc' 'getWirelessDevices'")) {
                $output = [json_encode([
                    'radio0' => [
                        'up' => true,
                        // phy explicitly null so the extra iwinfo/info enrichment call is
                        // skipped (see testGetWirelessOverviewToleratesAMissingPhyKey below for
                        // the "key entirely absent" case — TODO-1.5.md M11, now fixed).
                        'iwinfo' => [
                            'phy' => null,
                            'country' => 'US',
                            'hardware' => ['name' => 'MediaTek MT7615E'],
                            'hwmodes_text' => 'b/g/n',
                            'htmodes' => ['HT20', 'HT40'],
                        ],
                    ],
                ])];
            } else {
                $output = [];
            }
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'getWirelessOverview']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'radio0' => [
                'channel' => '8',
                'txpower' => null,
                'frequency' => null,
                'band' => '2.4 GHz',
                'htmode' => 'HT20',
                'up' => true,
                'disabled' => false,
                'phy' => null,
                'country' => 'US',
                'hardware' => 'MediaTek MT7615E',
                'hwmodes' => 'b/g/n',
                'htmodes' => ['HT20', 'HT40'],
                'interfaces' => [
                    [
                        'radio' => 'radio0',
                        'ifname' => 'phy0-sta0',
                        'section' => 'wifinet2',
                        'mode' => 'sta',
                        'ssid' => 'ExampleNet',
                        'encryption' => 'psk2+ccmp',
                        'network' => 'wwan',
                        'hidden' => false,
                        'up' => true,
                        'disabled' => false,
                    ],
                ],
            ],
        ], $result['data']);
    }

    /**
     * Regression test for TODO-1.5.md's M11: getWirelessOverview() used to check
     * `$radioInfo['up'] && $iwinfo['phy'] ?? null`, which — because `??` binds looser than
     * `&&` — parsed as `($up && $iwinfo['phy']) ?? null`, not the intended
     * `$up && ($iwinfo['phy'] ?? null)`. With the 'phy' key entirely absent (not just null),
     * that used to hit PHP's "Undefined array key" warning instead of coalescing cleanly.
     */
    public function testGetWirelessOverviewToleratesAMissingPhyKeyWithoutWarning(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode([
                    'values' => [
                        'radio0' => ['.type' => 'wifi-device', '.name' => 'radio0', 'channel' => '8', 'htmode' => 'HT20'],
                    ],
                ])];
            } elseif (str_contains($command, "'network.wireless' 'status'")) {
                $output = [json_encode(['radio0' => ['up' => true, 'interfaces' => []]])];
            } elseif (str_contains($command, "'luci-rpc' 'getWirelessDevices'")) {
                // No 'phy' key at all — the exact case the operator-precedence bug mishandled.
                $output = [json_encode(['radio0' => ['up' => true, 'iwinfo' => ['country' => 'US']]])];
            } else {
                $output = [];
            }
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'getWirelessOverview']);

        $this->assertNull($result['error']);
        $this->assertArrayHasKey('radio0', $result['data']);
        $this->assertNull($result['data']['radio0']['txpower'], 'Enrichment must be skipped, not attempted, when phy is unknown');
        $this->assertNull($result['data']['radio0']['frequency']);
    }

    public function testGetWirelessOverviewUsesTheConfiguredSixGigahertzBand(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode([
                    'values' => [
                        'radio3' => [
                            '.type' => 'wifi-device',
                            '.name' => 'radio3',
                            'band' => '6g',
                            'channel' => '1',
                            'htmode' => 'EHT80',
                        ],
                    ],
                ])];
            } elseif (str_contains($command, "'network.wireless' 'status'")) {
                $output = [json_encode(['radio3' => ['up' => false, 'interfaces' => []]])];
            } elseif (str_contains($command, "'luci-rpc' 'getWirelessDevices'")) {
                $output = [json_encode(['radio3' => [
                    'up' => false,
                    'iwinfo' => ['htmodes' => ['EHT80']],
                ]])];
            } else {
                $output = [];
            }
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'getWirelessOverview']);

        $this->assertNull($result['error']);
        $this->assertSame('6 GHz', $result['data']['radio3']['band']);
    }

    // -----------------------------------------------------------------
    // getRadioConfig
    // -----------------------------------------------------------------

    public function testGetRadioConfigReturnsCurrentSettingsAndAvailableOptions(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(5))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode(['values' => ['channel' => '8', 'htmode' => 'HT20']])];
            } elseif (str_contains($command, "'iwinfo' 'freqlist'")) {
                $output = [json_encode(['results' => [['channel' => 1, 'mhz' => 2412, 'restricted' => false]]])];
            } elseif (str_contains($command, "'iwinfo' 'txpowerlist'")) {
                $output = [json_encode(['results' => [['dbm' => 0, 'mw' => 1]]])];
            } elseif (str_contains($command, "'iwinfo' 'countrylist'")) {
                $output = [json_encode(['results' => [['code' => '00', 'name' => null]]])];
            } elseif (str_contains($command, "'luci-rpc' 'getWirelessDevices'")) {
                $output = [json_encode(['radio0' => ['iwinfo' => ['htmodes' => ['HT20', 'HT40']]]])];
            } else {
                $output = [];
            }
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getRadioConfig',
            'radio' => 'radio0',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'current' => [
                'channel' => '8',
                'txpower' => null,
                'htmode' => 'HT20',
                'country' => null,
                'disabled' => null,
            ],
            'available' => [
                'channels' => [['channel' => 1, 'mhz' => 2412, 'restricted' => false]],
                'txpowers' => [['dbm' => 0, 'mw' => 1]],
                'countries' => [['code' => '00', 'name' => null]],
                'htmodes' => ['HT20', 'HT40'],
            ],
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // setRadioConfig
    // -----------------------------------------------------------------

    public function testSetRadioConfigWritesUciAndReloadsTheRadioInTheBackground(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];
            if (str_contains($command, "uci -q get 'wireless.radio0'")) {
                return 'wifi-device';
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setRadioConfig',
            'radio' => 'radio0',
            'channel' => '6',
            'txpower' => 20,
            'htmode' => 'HT40',
            'country' => 'US',
            'disabled' => 0,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $reloadCommand = array_filter($capturedCommands, fn ($c) => str_contains($c, 'wifi reload'));
        $this->assertNotEmpty($reloadCommand, 'setRadioConfig must reload the radio via execBackground');
        $this->assertStringStartsWith('/usr/bin/nohup ', array_values($reloadCommand)[0]);
    }

    public function testSetRadioConfigThrowsWhenTheRadioDoesNotExistInUci(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // "uci -q get" fails => section not found
            $output = [];
        });

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Radio 'radio9' not found in wireless config");

        $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setRadioConfig',
            'radio' => 'radio9',
            'channel' => '6',
            'txpower' => 20,
            'htmode' => 'HT40',
            'country' => 'US',
            'disabled' => 0,
        ]);
    }

    // -----------------------------------------------------------------
    // getAssociationList
    // -----------------------------------------------------------------

    public function testGetAssociationListReturnsClientsFromUbusAssoclist(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'results' => [
                    [
                        'mac' => '02:00:00:00:00:01',
                        'signal' => -33,
                        'noise' => -69,
                        'rx' => ['rate' => 144400],
                        'tx' => ['rate' => 144400],
                        'inactive' => 700,
                    ],
                ],
            ])];
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getAssociationList',
            'interface' => 'phy0-ap0',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            [
                'mac' => '02:00:00:00:00:01',
                'signal' => -33,
                'noise' => -69,
                'rx_rate' => 144400,
                'tx_rate' => 144400,
                'inactive' => 700,
            ],
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // getInterfaceStatus
    // -----------------------------------------------------------------

    public function testGetInterfaceStatusReturnsStaConnectionDetailsFromWpaSupplicant(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(4))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];
            if (str_contains($command, "uci -q get 'wireless.wifinet2.device'")) {
                return 'radio0';
            }
            if (str_contains($command, "uci -q get 'wireless.wifinet2.mode'")) {
                return 'sta';
            }
            if (str_contains($command, "'network.wireless' 'status'")) {
                $output = [json_encode([
                    'radio0' => [
                        'up' => true,
                        'interfaces' => [
                            ['section' => 'wifinet2', 'ifname' => 'phy0-sta0'],
                        ],
                    ],
                ])];
                return '';
            }
            if (str_contains($command, "'wpa_supplicant' 'bss_info'")) {
                $output = [json_encode([
                    'wpa_state' => 'COMPLETED',
                    'ssid' => 'ExampleNet',
                    'bssid' => '02:00:00:00:00:01',
                    'ip_address' => '192.0.2.1',
                    'freq' => '2447',
                ])];
                return '';
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getInterfaceStatus',
            'section' => 'wifinet2',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'state' => 'COMPLETED',
            'mode' => 'sta',
            'ssid' => 'ExampleNet',
            'bssid' => '02:00:00:00:00:01',
            'ip' => '192.0.2.1',
            'frequency' => '2447',
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // addInterface
    // -----------------------------------------------------------------

    public function testAddInterfaceCreatesTheNextWifinetSectionAndReturnsItsName(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                // Only radio0 exists so far: no wifinetN sections yet.
                $output = [json_encode(['values' => [
                    'radio0' => ['.type' => 'wifi-device', '.name' => 'radio0'],
                ]])];
                return '';
            }
            $output = [];
            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'addInterface',
            'radio' => 'radio0',
            'ssid' => 'MyNetwork',
            'encryption' => 'psk2+ccmp',
            'key' => 'supersecret',
            'mode' => 'ap',
            'network' => 'lan',
            'hidden' => 0,
            'disabled' => 0,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['section' => 'wifinet0'], $result['data']);
    }

    public function testAddInterfaceStripsShellMetacharactersFromTheRadioNameBeforeWritingUci(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode(['values' => []])];
                return '';
            }
            $output = [];
            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'addInterface',
            'radio' => 'radio0; rm -rf /',
            'ssid' => 'MyNetwork',
            'encryption' => 'none',
            'key' => '',
            'mode' => 'ap',
            'network' => 'lan',
            'hidden' => 0,
            'disabled' => 0,
        ]);

        $this->assertNull($result['error']);
        $deviceCommand = array_values(array_filter($capturedCommands, fn ($c) => str_contains($c, '.device')));
        $this->assertNotEmpty($deviceCommand);
        $this->assertStringNotContainsString(';', $deviceCommand[0]);
        $this->assertStringContainsString('radio0rmrf', $deviceCommand[0]);
    }

    // -----------------------------------------------------------------
    // removeInterface
    // -----------------------------------------------------------------

    public function testRemoveInterfaceDeletesTheSectionAndReloadsWifi(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];
            if (str_contains($command, "uci -q get 'wireless.wifinet2'")) {
                return 'wifi-iface';
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'removeInterface',
            'section' => 'wifinet2',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $deleteCommand = array_values(array_filter($capturedCommands, fn ($c) => str_contains($c, 'uci delete')));
        $this->assertNotEmpty($deleteCommand);
        $this->assertStringContainsString('wireless.wifinet2', $deleteCommand[0]);
    }

    public function testRemoveInterfaceThrowsWhenTheSectionDoesNotExist(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
            $output = [];
        });

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Interface section 'wifinetXX' not found in wireless config");

        $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'removeInterface',
            'section' => 'wifinetXX',
        ]);
    }

    // -----------------------------------------------------------------
    // toggleInterface
    // -----------------------------------------------------------------

    public function testToggleInterfaceUpdatesTheDisabledFlagAndReloadsWifi(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];
            if (str_contains($command, "uci -q get 'wireless.wifinet2'")) {
                return 'wifi-iface';
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'toggleInterface',
            'section' => 'wifinet2',
            'disabled' => 1,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    // -----------------------------------------------------------------
    // getInterfaceConfig
    // -----------------------------------------------------------------

    public function testGetInterfaceConfigReturnsSectionFieldsAndRolePointerFlags(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];
            if (str_contains($command, "'uci' 'get'")) {
                $output = [json_encode(['values' => [
                    'device' => 'radio0',
                    'network' => 'wwan',
                    'mode' => 'sta',
                    'ssid' => 'ExampleNet',
                    'encryption' => 'psk2+ccmp',
                    'key' => 'secret',
                    'disabled' => '0',
                    'hidden' => '0',
                ]])];
                return '';
            }
            if (str_contains($command, 'management_interface')) {
                return 'wifinet2'; // this section IS the management interface
            }
            if (str_contains($command, 'recon_interface')) {
                return 'wifinet9'; // some other section owns the recon role
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'getInterfaceConfig',
            'section' => 'wifinet2',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'device' => 'radio0',
            'network' => 'wwan',
            'mode' => 'sta',
            'ssid' => 'ExampleNet',
            'encryption' => 'psk2+ccmp',
            'key' => 'secret',
            'disabled' => '0',
            'hidden' => '0',
            'bssid' => '',
            'isManagement' => '1',
            'isRecon' => '0',
        ], $result['data']);
    }

    // -----------------------------------------------------------------
    // setInterfaceConfig
    // -----------------------------------------------------------------

    public function testSetInterfaceConfigUpdatesTheSectionAndReloadsWifi(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];
            if (str_contains($command, "uci -q get 'wireless.wifinet2'")) {
                return 'wifi-iface';
            }

            return '';
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setInterfaceConfig',
            'section' => 'wifinet2',
            'ssid' => 'RenamedNetwork',
            'encryption' => 'psk2+ccmp',
            'key' => 'newsecret',
            'mode' => 'ap',
            'network' => 'lan',
            'hidden' => 0,
            'disabled' => 0,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    public function testSetInterfaceConfigThrowsWhenTheSectionDoesNotExist(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
            $output = [];
        });

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Interface section 'wifinetXX' not found in wireless config");

        $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setInterfaceConfig',
            'section' => 'wifinetXX',
            'ssid' => 'RenamedNetwork',
            'encryption' => 'psk2+ccmp',
            'key' => 'newsecret',
            'mode' => 'ap',
            'network' => 'lan',
            'hidden' => 0,
            'disabled' => 0,
        ]);
    }

    // -----------------------------------------------------------------
    // getRawWirelessConfig / setRawWirelessConfig
    // -----------------------------------------------------------------

    public function testGetRawWirelessConfigReturnsTheConfigFileContentWrappedInAContentKey(): void
    {
        $fileGetContents = $this->getFunctionMock(__NAMESPACE__, 'file_get_contents');
        $fileGetContents->expects($this->once())
            ->with('/etc/config/wireless')
            ->willReturn("\nconfig wifi-device 'radio0'\n\toption type 'mac80211'\n");

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'getRawWirelessConfig']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'content' => "\nconfig wifi-device 'radio0'\n\toption type 'mac80211'\n",
        ], $result['data']);
    }

    public function testGetRawWirelessConfigReturnsAnEmptyStringWhenTheFileIsUnreadable(): void
    {
        $fileGetContents = $this->getFunctionMock(__NAMESPACE__, 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturn(false);

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'getRawWirelessConfig']);

        $this->assertNull($result['error']);
        $this->assertSame(['content' => ''], $result['data']);
    }

    public function testSetRawWirelessConfigWritesTheFileAndReloadsWifiInTheBackground(): void
    {
        $filePutContents = $this->getFunctionMock(__NAMESPACE__, 'file_put_contents');
        $filePutContents->expects($this->once())
            ->with('/etc/config/wireless', "config wifi-device 'radio0'\n")
            ->willReturn(30);

        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setRawWirelessConfig',
            'content' => "config wifi-device 'radio0'\n",
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('wifi reload', $captured);
    }

    public function testSetRawWirelessConfigThrowsWhenTheFileCannotBeWritten(): void
    {
        $filePutContents = $this->getFunctionMock(__NAMESPACE__, 'file_put_contents');
        $filePutContents->expects($this->once())->willReturn(false);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Failed to write wireless config');

        $this->dispatch(WirelessController::class, 'wireless', [
            'action' => 'setRawWirelessConfig',
            'content' => 'garbage',
        ]);
    }

    // -----------------------------------------------------------------
    // resetWirelessConfig
    // -----------------------------------------------------------------

    public function testResetWirelessConfigRegeneratesConfigAndReloadsWifi(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];
        });

        $result = $this->dispatch(WirelessController::class, 'wireless', ['action' => 'resetWirelessConfig']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('wifi config >', $capturedCommands[0]);
        $this->assertStringContainsString('wifi reload', $capturedCommands[1]);
    }
}
