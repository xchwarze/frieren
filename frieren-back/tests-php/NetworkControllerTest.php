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
        ], $interfaces[0]);
        $this->assertStringContainsString('network.interface', $capturedCommand);
        $this->assertStringContainsString('dump', $capturedCommand);
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
