<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `network` module (interfaces, DHCP leases, ARP table,
 * ping/traceroute/nslookup diagnostics). The host-validation tests replicate
 * the e2e security check in frieren-front/e2e/api/network.api.spec.js
 * ("runPing rejects an invalid host") directly against the Controller, proving
 * NetworkController::resolveHost()'s whitelist regex rejects shell
 * metacharacters BEFORE anything reaches exec().
 */

namespace frieren\modules\network;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class NetworkControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    private function findCommandContaining(array $commands, string $needle): ?string
    {
        foreach ($commands as $command) {
            if (strpos($command, $needle) !== false) {
                return $command;
            }
        }

        return null;
    }

    // --- runPing / runTraceroute / runNslookup: host validation -----------

    public function testRunPingRejectsAHostWithShellMetacharactersWithoutExecutingAnything(): void
    {
        // Same payload as the e2e spec's "runPing rejects an invalid host" case.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runPing',
            'host' => 'bad host; rm -rf /',
        ]);

        $this->assertSame('Invalid host', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testRunTracerouteRejectsAHostWithShellMetacharactersWithoutExecutingAnything(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runTraceroute',
            'host' => 'bad host; rm -rf /',
        ]);

        $this->assertSame('Invalid host', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testRunNslookupRejectsAHostWithShellMetacharactersWithoutExecutingAnything(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runNslookup',
            'host' => 'bad host; rm -rf /',
        ]);

        $this->assertSame('Invalid host', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testRunPingRejectsAMissingHost(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'runPing']);

        $this->assertSame('Invalid host', $result['error']);
    }

    // --- runPing / runTraceroute / runNslookup: happy path -----------------

    public function testRunPingReturnsCommandOutputForAValidHost(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 0;
            $output = [
                'PING 127.0.0.1 (127.0.0.1): 56 data bytes',
                '64 bytes from 127.0.0.1: seq=0 ttl=64 time=0.577 ms',
            ];
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runPing',
            'host' => '127.0.0.1',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(
            "PING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: seq=0 ttl=64 time=0.577 ms",
            $result['data']['output']
        );
        $this->assertStringStartsWith('ping -c 5 -W 2 ', $captured);
        $this->assertStringContainsString(escapeshellarg('127.0.0.1'), $captured);
    }

    public function testRunPingReturnsNoResponseWhenTheCommandFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runPing',
            'host' => '127.0.0.1',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame('No response', $result['data']['output']);
    }

    public function testRunTracerouteReturnsCommandOutputForAValidHost(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 0;
            $output = ['traceroute to 127.0.0.1 (127.0.0.1), 15 hops max'];
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runTraceroute',
            'host' => '127.0.0.1',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame('traceroute to 127.0.0.1 (127.0.0.1), 15 hops max', $result['data']['output']);
        $this->assertStringStartsWith('traceroute -q 1 -w 1 -m 15 ', $captured);
        $this->assertStringContainsString(escapeshellarg('127.0.0.1'), $captured);
    }

    public function testRunNslookupReturnsCommandOutputForAValidHost(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 0;
            $output = ["Server:\t\t127.0.0.1", 'Address: 127.0.0.1:53'];
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'runNslookup',
            'host' => 'localhost',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame("Server:\t\t127.0.0.1\nAddress: 127.0.0.1:53", $result['data']['output']);
        $this->assertStringStartsWith('nslookup ', $captured);
        $this->assertStringContainsString(escapeshellarg('localhost'), $captured);
    }

    // --- getInterfaces -------------------------------------------------

    public function testGetInterfacesMergesLiveStatusWithUciDataAndSkipsLoopback(): void
    {
        $capturedCommand = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommand) {
            $capturedCommand = $command;
            $retval = 0;
            $output = [json_encode([
                'interface' => [
                    ['interface' => 'loopback', 'proto' => 'static', 'up' => true],
                    [
                        'interface' => 'lan',
                        'proto' => 'static',
                        'up' => true,
                        'ipv4-address' => [['address' => '192.0.2.7', 'mask' => 24]],
                        'uptime' => 54516,
                        'l3_device' => 'br-lan',
                    ],
                ],
            ])];
        });

        $this->getFunctionMock('frieren\helper', 'file_exists')->expects($this->once())->willReturn(true);
        $this->getFunctionMock('frieren\helper', 'file')->expects($this->once())->willReturn([
            "config interface 'lan'",
            "\toption proto 'static'",
            "\toption gateway '192.0.2.1'",
            "\tlist dns '1.1.1.1'",
            "\tlist dns '8.8.8.8'",
        ]);

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getInterfaces']);

        $this->assertNull($result['error']);
        $interfaces = $result['data']['interfaces'];
        $this->assertCount(1, $interfaces, 'The loopback interface must be excluded');
        $this->assertSame([
            'name' => 'lan',
            'proto' => 'static',
            'up' => true,
            'ipaddr' => '192.0.2.7',
            'netmask' => '255.255.255.0',
            'gateway' => '192.0.2.1',
            'dns' => ['1.1.1.1', '8.8.8.8'],
            'uptime' => 54516,
            'device' => 'br-lan',
            'mtu' => null,
            'macaddr' => null,
            'peerdns' => true,
        ], $interfaces[0]);
        $this->assertStringContainsString('network.interface', $capturedCommand);
        $this->assertStringContainsString('dump', $capturedCommand);
    }

    public function testGetInterfacesReturnsMtuMacaddrAndPeerdnsFromUci(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'interface' => [
                    [
                        'interface' => 'lan',
                        'proto' => 'static',
                        'up' => true,
                        'ipv4-address' => [['address' => '192.0.2.7', 'mask' => 24]],
                        'uptime' => 54516,
                        'l3_device' => 'br-lan',
                    ],
                ],
            ])];
        });

        $this->getFunctionMock('frieren\helper', 'file_exists')->expects($this->once())->willReturn(true);
        $this->getFunctionMock('frieren\helper', 'file')->expects($this->once())->willReturn([
            "config interface 'lan'",
            "\toption proto 'static'",
            "\toption mtu '1400'",
            "\toption macaddr 'AA:BB:CC:DD:EE:FF'",
            "\toption peerdns '0'",
        ]);

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getInterfaces']);

        $this->assertNull($result['error']);
        $interface = $result['data']['interfaces'][0];
        $this->assertSame('1400', $interface['mtu']);
        $this->assertSame('AA:BB:CC:DD:EE:FF', $interface['macaddr']);
        $this->assertFalse($interface['peerdns']);
    }

    public function testGetInterfacesReturnsNullGatewayAndEmptyDnsWhenUciConfigIsUnavailable(): void
    {
        // Matches the recorded device contract exactly: gateway=null, dns=[]
        // when /etc/config/network can't be read (uciReadConfig() throws and
        // getInterfaces() falls back to an empty uci section map).
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'interface' => [
                    [
                        'interface' => 'lan',
                        'proto' => 'static',
                        'up' => true,
                        'ipv4-address' => [['address' => '192.0.2.7', 'mask' => 24]],
                        'uptime' => 54516,
                        'l3_device' => 'br-lan',
                    ],
                ],
            ])];
        });

        $this->getFunctionMock('frieren\helper', 'file_exists')->expects($this->once())->willReturn(false);

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getInterfaces']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'name' => 'lan',
            'proto' => 'static',
            'up' => true,
            'ipaddr' => '192.0.2.7',
            'netmask' => '255.255.255.0',
            'gateway' => null,
            'dns' => [],
            'uptime' => 54516,
            'device' => 'br-lan',
            'mtu' => null,
            'macaddr' => null,
            'peerdns' => true,
        ], $result['data']['interfaces'][0]);
    }

    // --- getDhcpLeases ---------------------------------------------------

    public function testGetDhcpLeasesReturnsEmptyArrayWhenLeaseFileIsMissing(): void
    {
        // getDhcpLeases() checks file_exists()/file() directly (not through
        // OpenWrtHelper), so these calls resolve in ModuleOpenWrtHelper's own
        // namespace, not frieren\helper.
        $this->getFunctionMock('frieren\modules\network', 'file_exists')->expects($this->once())->willReturn(false);

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getDhcpLeases']);

        $this->assertNull($result['error']);
        $this->assertSame(['leases' => []], $result['data']);
    }

    public function testGetDhcpLeasesParsesEntriesAndNormalizesTheWildcardHostname(): void
    {
        $this->getFunctionMock('frieren\modules\network', 'file_exists')->expects($this->once())->willReturn(true);
        $this->getFunctionMock('frieren\modules\network', 'file')->expects($this->once())->willReturn([
            '1781140796 02:00:00:00:00:02 192.0.2.3 client-1 *',
            '1781140800 02:00:00:00:00:03 192.0.2.4 * *',
        ]);

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getDhcpLeases']);

        $this->assertNull($result['error']);
        $this->assertSame([
            ['hostname' => 'client-1', 'ip' => '192.0.2.3', 'mac' => '02:00:00:00:00:02', 'expires' => 1781140796],
            ['hostname' => '', 'ip' => '192.0.2.4', 'mac' => '02:00:00:00:00:03', 'expires' => 1781140800],
        ], $result['data']['leases']);
    }

    // --- getStaticLeases ---------------------------------------------------

    public function testGetStaticLeasesReturnsOnlyUciHostSectionsMappedToNameMacIp(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'values' => [
                    'cfg01e3' => [
                        '.type' => 'host',
                        '.name' => 'cfg01e3',
                        'name' => 'client-1',
                        'mac' => '02:00:00:00:00:02',
                        'ip' => '192.0.2.3',
                    ],
                    // A non-host dhcp section (e.g. the `dnsmasq` config block)
                    // must be filtered out.
                    'wan' => ['.type' => 'dnsmasq', '.name' => 'wan'],
                ],
            ])];
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getStaticLeases']);

        $this->assertNull($result['error']);
        $this->assertSame([
            ['name' => 'client-1', 'mac' => '02:00:00:00:00:02', 'ip' => '192.0.2.3'],
        ], $result['data']['leases']);
    }

    public function testGetStaticLeasesReturnsEmptyArrayWhenNoHostsAreConfigured(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode(['values' => []])];
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getStaticLeases']);

        $this->assertNull($result['error']);
        $this->assertSame(['leases' => []], $result['data']);
    }

    // --- setInterface / toggleInterface: name + proto validation ----------

    /**
     * INTERFACE_NAME_REGEX used to be `^[a-zA-Z0-9_]+$`, tighter than netifd
     * needs for a UCI section name. Widened defensively to allow hyphens.
     * This is a name-validity check, not a security boundary: the widened
     * charset still excludes every shell metacharacter (see the rejection test
     * below), and the name is escapeshellcmd()'d downstream regardless.
     */
    public function testToggleInterfaceAcceptsAHyphenatedName(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 0;
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'toggleInterface',
            'name' => 'br-lan',
            'state' => 'down',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertSame('ubus call network.interface.br-lan down', $captured);
    }

    public function testToggleInterfaceStillRejectsANameWithShellMetacharacters(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'toggleInterface',
            'name' => 'lan; rm -rf /',
            'state' => 'down',
        ]);

        $this->assertSame('Invalid interface', $result['error']);
        $this->assertNull($result['data']);
    }

    /**
     * dhcpv6 needs no UCI option beyond the `proto` that setInterface() already
     * writes, so it travels the same dynamic-proto path as dhcp: the static-only
     * options are deleted rather than left behind.
     */
    public function testSetInterfaceAcceptsDhcpv6AndClearsTheStaticOnlyOptions(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->atLeastOnce())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $retval = 0;
            $output = [];

            // interfaceExists() reads the section back through `uci -q get`.
            return strpos($command, 'uci -q get') === 0 ? 'interface' : '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'setInterface',
            'name' => 'wan6',
            'proto' => 'dhcpv6',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);

        $protoCommand = $this->findCommandContaining($captured, 'network.wan6.proto');
        $this->assertNotNull($protoCommand, 'Expected the proto option to be written');
        $this->assertStringStartsWith('uci set ', $protoCommand);
        $this->assertStringContainsString('dhcpv6', $protoCommand);

        foreach (['ipaddr', 'netmask', 'gateway', 'dns'] as $option) {
            $command = $this->findCommandContaining($captured, "network.wan6.{$option}");
            $this->assertNotNull($command, "Expected the static-only {$option} option to be deleted");
            $this->assertStringStartsWith('uci -q delete ', $command);
        }
    }

    /**
     * Deliberate scope boundary: pppoe (and the other tunnel protocols) need
     * UCI options — credentials, tunnel endpoints — that neither the form nor
     * setInterface() collects, so writing only `proto` would leave the
     * interface unusable. They stay rejected until that gets its own design.
     */
    public function testSetInterfaceRejectsAProtocolThatNeedsOptionsTheHelperDoesNotWrite(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'setInterface',
            'name' => 'wan',
            'proto' => 'pppoe',
        ]);

        $this->assertSame('Unsupported protocol', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testSetInterfaceRejectsAnOutOfRangeMtuWithoutWritingAnything(): void
    {
        // setInterface() confirms the section exists (one `uci -q get`) before validating
        // mtu; only that one lookup should fire, no writes.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];

            return 'interface';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'setInterface',
            'name' => 'lan',
            'proto' => 'dhcp',
            'mtu' => '100',
        ]);

        $this->assertSame('Invalid MTU', $result['error']);
    }

    public function testSetInterfaceWritesMtuMacaddrAndPeerdns(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->atLeastOnce())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $retval = 0;
            $output = [];

            return strpos($command, 'uci -q get') === 0 ? 'interface' : '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'setInterface',
            'name' => 'lan',
            'proto' => 'dhcp',
            'mtu' => '1400',
            'macaddr' => 'AA:BB:CC:DD:EE:FF',
            'peerdns' => false,
        ]);

        $this->assertNull($result['error']);

        $mtuCommand = $this->findCommandContaining($captured, 'network.lan.mtu');
        $this->assertNotNull($mtuCommand);
        $this->assertStringContainsString(escapeshellarg('1400'), $mtuCommand);

        $macaddrCommand = $this->findCommandContaining($captured, 'network.lan.macaddr');
        $this->assertNotNull($macaddrCommand);
        $this->assertStringContainsString(escapeshellarg('AA:BB:CC:DD:EE:FF'), $macaddrCommand);

        $peerdnsCommand = $this->findCommandContaining($captured, 'network.lan.peerdns');
        $this->assertNotNull($peerdnsCommand);
        $this->assertStringContainsString(escapeshellarg('0'), $peerdnsCommand);
    }

    public function testSetInterfaceDeletesMtuAndMacaddrWhenEmpty(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->atLeastOnce())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $retval = 0;
            $output = [];

            return strpos($command, 'uci -q get') === 0 ? 'interface' : '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'setInterface',
            'name' => 'lan',
            'proto' => 'dhcp',
            'mtu' => '',
            'macaddr' => '',
            'peerdns' => true,
        ]);

        $this->assertNull($result['error']);

        $mtuCommand = $this->findCommandContaining($captured, 'network.lan.mtu');
        $this->assertNotNull($mtuCommand);
        $this->assertStringStartsWith('uci -q delete ', $mtuCommand);

        $macaddrCommand = $this->findCommandContaining($captured, 'network.lan.macaddr');
        $this->assertNotNull($macaddrCommand);
        $this->assertStringStartsWith('uci -q delete ', $macaddrCommand);

        $peerdnsCommand = $this->findCommandContaining($captured, 'network.lan.peerdns');
        $this->assertNotNull($peerdnsCommand);
        $this->assertStringContainsString(escapeshellarg('1'), $peerdnsCommand);
    }

    // --- toggleInterface: restart -----------------------------------------

    public function testToggleInterfaceRestartBringsTheInterfaceDownThenUp(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];

            return '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'toggleInterface',
            'name' => 'lan',
            'state' => 'restart',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertSame([
            'ubus call network.interface.lan down',
            'ubus call network.interface.lan up',
        ], $capturedCommands);
    }

    public function testToggleInterfaceRejectsAnUnknownAction(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'toggleInterface',
            'name' => 'lan',
            'state' => 'reboot',
        ]);

        $this->assertSame('Unsupported action', $result['error']);
        $this->assertNull($result['data']);
    }

    // -----------------------------------------------------------------
    // getAvailableDevices
    // -----------------------------------------------------------------

    public function testGetAvailableDevicesReturnsTheLiveDeviceListSortedExcludingLoopback(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [json_encode([
                'wan' => [], 'br-lan' => [], 'lo' => [], 'eth0' => [],
            ])];
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getAvailableDevices']);

        $this->assertNull($result['error']);
        $this->assertSame(['devices' => ['br-lan', 'eth0', 'wan']], $result['data']);
    }

    public function testGetAvailableDevicesReturnsAnEmptyListWhenUbusFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
            $output = [];
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getAvailableDevices']);

        $this->assertNull($result['error']);
        $this->assertSame(['devices' => []], $result['data']);
    }

    // -----------------------------------------------------------------
    // addInterface
    // -----------------------------------------------------------------

    public function testAddInterfaceCreatesTheSectionAndWritesStaticProtoFields(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];

            // interfaceExists() reads the section back through `uci -q get`; report
            // "not found" (non-zero) so addInterface() proceeds to create it.
            if (strpos($command, 'uci -q get') === 0) {
                $retval = 1;

                return '';
            }

            return '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'device' => 'br-lan',
            'proto' => 'static',
            'ipaddr' => '192.0.2.10',
            'netmask' => '255.255.255.0',
            'gateway' => '192.0.2.1',
            'dns' => ['1.1.1.1'],
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);

        $createCommand = escapeshellcmd('uci set ' . escapeshellarg('network.guest=interface'));
        $this->assertContains($createCommand, $capturedCommands);

        $deviceCommand = $this->findCommandContaining($capturedCommands, 'network.guest.device');
        $this->assertNotNull($deviceCommand);
        $this->assertStringContainsString(escapeshellarg('br-lan'), $deviceCommand);

        $protoCommand = $this->findCommandContaining($capturedCommands, 'network.guest.proto');
        $this->assertNotNull($protoCommand);
        $this->assertStringContainsString(escapeshellarg('static'), $protoCommand);

        $ipaddrCommand = $this->findCommandContaining($capturedCommands, 'network.guest.ipaddr');
        $this->assertNotNull($ipaddrCommand);
        $this->assertStringContainsString(escapeshellarg('192.0.2.10'), $ipaddrCommand);

        $netmaskCommand = $this->findCommandContaining($capturedCommands, 'network.guest.netmask');
        $this->assertNotNull($netmaskCommand);
        $this->assertStringContainsString(escapeshellarg('255.255.255.0'), $netmaskCommand);

        $gatewayCommand = $this->findCommandContaining($capturedCommands, 'network.guest.gateway');
        $this->assertNotNull($gatewayCommand);
        $this->assertStringContainsString(escapeshellarg('192.0.2.1'), $gatewayCommand);

        $dnsCommand = array_values(array_filter(
            $capturedCommands,
            fn ($c) => strpos($c, 'network.guest.dns') !== false && strpos($c, 'add_list') !== false
        ));
        $this->assertNotEmpty($dnsCommand, 'Expected the dns server to be added via uci add_list');
        $this->assertStringContainsString(escapeshellarg('1.1.1.1'), $dnsCommand[0]);
    }

    public function testAddInterfaceThrowsWhenTheNameAlreadyExists(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            $output = [];

            return strpos($command, 'uci -q get') === 0 ? 'interface' : '';
        });

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Interface 'lan' already exists");

        $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'lan',
            'device' => 'br-lan',
            'proto' => 'dhcp',
        ]);
    }

    public function testAddInterfaceRejectsAMissingDeviceWithoutWritingAnything(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'proto' => 'dhcp',
        ]);

        $this->assertSame('Device is mandatory', $result['error']);
    }

    public function testAddInterfaceRejectsAnOutOfRangeMtuWithoutWritingAnything(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'device' => 'br-lan',
            'proto' => 'dhcp',
            'mtu' => '99999',
        ]);

        $this->assertSame('Invalid MTU', $result['error']);
    }

    public function testAddInterfaceRejectsANonNumericMtuWithoutWritingAnything(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'device' => 'br-lan',
            'proto' => 'dhcp',
            'mtu' => 'abc',
        ]);

        $this->assertSame('Invalid MTU', $result['error']);
    }

    public function testAddInterfaceWritesMtuMacaddrAndPeerdns(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];

            if (strpos($command, 'uci -q get') === 0) {
                $retval = 1;

                return '';
            }

            return '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'device' => 'br-lan',
            'proto' => 'dhcp',
            'mtu' => '1400',
            'macaddr' => 'AA:BB:CC:DD:EE:FF',
            'peerdns' => false,
        ]);

        $this->assertNull($result['error']);

        $mtuCommand = $this->findCommandContaining($capturedCommands, 'network.guest.mtu');
        $this->assertNotNull($mtuCommand);
        $this->assertStringContainsString(escapeshellarg('1400'), $mtuCommand);

        $macaddrCommand = $this->findCommandContaining($capturedCommands, 'network.guest.macaddr');
        $this->assertNotNull($macaddrCommand);
        $this->assertStringContainsString(escapeshellarg('AA:BB:CC:DD:EE:FF'), $macaddrCommand);

        $peerdnsCommand = $this->findCommandContaining($capturedCommands, 'network.guest.peerdns');
        $this->assertNotNull($peerdnsCommand);
        $this->assertStringContainsString(escapeshellarg('0'), $peerdnsCommand);
    }

    public function testAddInterfaceOmitsMtuAndMacaddrWhenNotProvided(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];

            if (strpos($command, 'uci -q get') === 0) {
                $retval = 1;

                return '';
            }

            return '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'addInterface',
            'name' => 'guest',
            'device' => 'br-lan',
            'proto' => 'dhcp',
        ]);

        $this->assertNull($result['error']);

        $mtuCommand = $this->findCommandContaining($capturedCommands, 'network.guest.mtu');
        $this->assertNotNull($mtuCommand);
        $this->assertStringStartsWith('uci -q delete ', $mtuCommand);

        $macaddrCommand = $this->findCommandContaining($capturedCommands, 'network.guest.macaddr');
        $this->assertNotNull($macaddrCommand);
        $this->assertStringStartsWith('uci -q delete ', $macaddrCommand);
    }

    // -----------------------------------------------------------------
    // removeInterface
    // -----------------------------------------------------------------

    public function testRemoveInterfaceDeletesTheSectionAndReloads(): void
    {
        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $retval = 0;
            $output = [];

            if (strpos($command, 'uci -q get') === 0) {
                return 'interface';
            }

            return '';
        });

        $result = $this->dispatch(NetworkController::class, 'network', [
            'action' => 'removeInterface',
            'name' => 'guest',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);

        $deleteCommand = array_values(array_filter(
            $capturedCommands,
            fn ($c) => strpos($c, 'network.guest') !== false && strpos($c, 'delete') !== false
        ));
        $this->assertNotEmpty($deleteCommand, 'Expected the section to be deleted');

        $reloadCommand = $this->findCommandContaining($capturedCommands, 'reload');
        $this->assertNotNull($reloadCommand, 'Expected the network config to be reloaded');
    }

    public function testRemoveInterfaceThrowsWhenTheNameDoesNotExist(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
            $output = [];
        });

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Interface 'ghost' not found");

        $this->dispatch(NetworkController::class, 'network', [
            'action' => 'removeInterface',
            'name' => 'ghost',
        ]);
    }

    // --- getArpTable ---------------------------------------------------

    public function testGetArpTableParsesNeighborLinesAndSkipsMalformedOnes(): void
    {
        $capturedCommand = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommand) {
            $capturedCommand = $command;
            $retval = 0;
            $output = [
                '192.0.2.8 dev phy0-sta0 lladdr 02:00:00:00:00:04 STALE',
                '192.0.2.1 dev br-lan  FAILED',
                'this line has no dev keyword at all',
            ];
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getArpTable']);

        $this->assertNull($result['error']);
        $this->assertSame([
            ['ip' => '192.0.2.8', 'mac' => '02:00:00:00:00:04', 'device' => 'phy0-sta0', 'state' => 'STALE'],
            ['ip' => '192.0.2.1', 'mac' => '', 'device' => 'br-lan', 'state' => 'FAILED'],
        ], $result['data']['neighbors']);
        $this->assertStringStartsWith('ip neigh', $capturedCommand);
    }

    public function testGetArpTableReturnsEmptyArrayWhenExecFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(NetworkController::class, 'network', ['action' => 'getArpTable']);

        $this->assertNull($result['error']);
        $this->assertSame(['neighbors' => []], $result['data']);
    }
}
