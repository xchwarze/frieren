<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `system` module (USB devices, filesystem usage, logs,
 * background diagnostics script, and init.d service control/enable-toggle).
 *
 * Mocking notes:
 *  - `getUsbDevices`/`getFileSystemUsage`/`getSystemLogs`/`controlService`/
 *    `toggleEnabled` all bottom out in `OpenWrtHelper::exec()`'s unqualified
 *    `exec()` call, intercepted in `frieren\helper` (same pattern as the other
 *    controller suites).
 *  - `getServices`/`controlService`/`toggleEnabled` also read the filesystem
 *    directly from *this* module's own helper (`scandir()`, `is_file()`,
 *    `glob()`), all written inside `frieren\modules\system` — so those are
 *    intercepted in this test's own namespace instead.
 *  - `startDiagnosticsScript`/`getDiagnosticsStatus` follow the
 *    BackgroundTaskHelper pattern (see BackgroundTaskHelperTest): real files
 *    under /tmp, cleaned up in tearDown().
 *  - `downloadDiagnosticsFile` calls `ResponseHandler::streamFile()`, which
 *    `exit()`s on every path — it cannot be exercised in-process and is left
 *    uncovered, per the harness's own convention (see HeaderControllerTest's
 *    handling of `dispatchResponse()`).
 */

namespace frieren\modules\system;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;
use frieren\helper\BackgroundTaskHelper;

class SystemControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    protected function tearDown(): void
    {
        BackgroundTaskHelper::cleanup(SystemController::TASK_DIAGNOSTICS);
        parent::tearDown();
    }

    // -----------------------------------------------------------------
    // getUsbDevices
    // -----------------------------------------------------------------

    public function testGetUsbDevicesParsesLsusbOutput(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [
                'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub',
                'Bus 002 Device 003: ID 0781:5583 SanDisk Corp. Ultra',
            ];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getUsbDevices']);

        $this->assertNull($result['error']);
        $this->assertSame([
            ['bus' => '001', 'device' => '001', 'id' => '1d6b:0002', 'name' => 'Linux Foundation 2.0 root hub'],
            ['bus' => '002', 'device' => '003', 'id' => '0781:5583', 'name' => 'SanDisk Corp. Ultra'],
        ], $result['data']);
    }

    public function testGetUsbDevicesReturnsErrorWhenTheCommandFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getUsbDevices']);

        $this->assertSame('Error getting usb devices.', $result['error']);
        $this->assertNull($result['data']);
    }

    // -----------------------------------------------------------------
    // getFileSystemUsage
    // -----------------------------------------------------------------

    public function testGetFileSystemUsageParsesDfOutput(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [
                'Filesystem     Type      Size  Used Avail Use% Mounted on',
                '/dev/root      squashfs  4.5M  4.5M     0 100% /rom',
            ];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getFileSystemUsage']);

        $this->assertNull($result['error']);
        $this->assertSame([
            [
                'filesystem' => '/dev/root',
                'type' => 'squashfs',
                'size' => '4.5M',
                'used' => '4.5M',
                'available' => '0',
                'usePercent' => '100%',
                'mountedOn' => '/rom',
            ],
        ], $result['data']);
    }

    public function testGetFileSystemUsageReturnsErrorWhenTheCommandFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getFileSystemUsage']);

        $this->assertSame('Error getting file system usage.', $result['error']);
        $this->assertNull($result['data']);
    }

    // -----------------------------------------------------------------
    // getSystemLogs
    // -----------------------------------------------------------------

    public function testGetSystemLogsParsesLogreadOutputAndReversesOrder(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [
                'Wed Jun 10 18:15:09 2026 daemon.info dnsmasq[1200]: query answered',
                'Wed Jun 10 18:15:10 2026 daemon.warn odhcpd[1682]: lease expired',
            ];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getSystemLogs']);

        $this->assertNull($result['error']);
        $this->assertSame([
            ['timestamp' => 'Wed Jun 10 18:15:10 2026', 'tag' => 'daemon.warn', 'process' => 'odhcpd[1682]', 'message' => 'lease expired'],
            ['timestamp' => 'Wed Jun 10 18:15:09 2026', 'tag' => 'daemon.info', 'process' => 'dnsmasq[1200]', 'message' => 'query answered'],
        ], $result['data']);
    }

    public function testGetSystemLogsWithoutSearchOmitsDashEFilter(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $output = ['Wed Jun 10 18:15:10 2026 daemon.warn odhcpd[1682]: lease expired'];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getSystemLogs']);

        $this->assertNull($result['error']);
        $this->assertSame('logread -l 1000', $captured);
    }

    public function testGetSystemLogsWithSearchAddsAnEscapedDashEFilter(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $output = ['Wed Jun 10 18:15:10 2026 daemon.warn odhcpd[1682]: lease expired'];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'getSystemLogs',
            'search' => 'kern',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame("logread -l 1000 -e 'kern'", $captured);
    }

    /**
     * `search` is attacker-controlled (front-end passes it straight through).
     * ModuleOpenWrtHelper::getSystemLogs() wraps it with escapeshellarg() before
     * building the logread command, and OpenWrtHelper::exec() additionally runs
     * the *whole* command through escapeshellcmd() (default $raw = false). The
     * net effect: shell metacharacters inside the search term never escape the
     * single-quoted argument — no command injection is possible. Note this is
     * belt-and-suspenders rather than free: escapeshellcmd() also backslashes
     * metacharacters *inside* the already-quoted argument (see the assertion
     * below), which will alter what the pattern actually matches in logread
     * for search terms containing shell metacharacters. Functional quirk, not
     * a security bug.
     */
    /**
     * Regression test for TODO-1.5.md's M12: getSystemLogs() used to call
     * OpenWrtHelper::exec($command, false) — non-raw — so the whole command line, including
     * the already-escapeshellarg()'d search term, went through escapeshellcmd() a second
     * time, backslash-mangling any shell metacharacter inside it. It's now called with
     * $raw=true, so the search term arrives at logread exactly as escapeshellarg() quoted it
     * (still safe — no injection either way, this was a correctness bug, not a security one).
     */
    public function testGetSystemLogsPassesTheSearchTermThroughExactlyOnceEscaped(): void
    {
        $malicious = 'kern; rm -rf / #';
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 1;
        });

        $this->dispatch(SystemController::class, 'system', [
            'action' => 'getSystemLogs',
            'search' => $malicious,
        ]);

        $expected = 'logread -l 1000 -e ' . escapeshellarg($malicious);
        $this->assertSame($expected, $captured);
        $this->assertStringContainsString($malicious, $captured, 'The literal search term must survive, not a backslash-mangled copy');
    }

    public function testGetSystemLogsReturnsErrorWhenTheCommandFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getSystemLogs']);

        $this->assertSame('Error getting system logs.', $result['error']);
        $this->assertNull($result['data']);
    }

    // -----------------------------------------------------------------
    // startDiagnosticsScript / getDiagnosticsStatus
    // -----------------------------------------------------------------

    public function testStartDiagnosticsScriptLaunchesTheDiagnosticsScriptInTheBackground(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'startDiagnosticsScript']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('/frieren/modules/system/bin/diagnostics.sh', $captured);
        $flagPath = BackgroundTaskHelper::getFlagPath(SystemController::TASK_DIAGNOSTICS);
        $this->assertStringContainsString("touch {$flagPath}", $captured);
        $this->assertStringStartsWith('/usr/bin/nohup sh -c', $captured);
    }

    public function testGetDiagnosticsStatusReflectsTheLogAndFlagFiles(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath(SystemController::TASK_DIAGNOSTICS), "diagnostics output\n");
        touch(BackgroundTaskHelper::getFlagPath(SystemController::TASK_DIAGNOSTICS));

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getDiagnosticsStatus']);

        $this->assertNull($result['error']);
        $this->assertSame("diagnostics output\n", $result['data']['status']);
        $this->assertTrue($result['data']['completed']);
    }

    public function testGetDiagnosticsStatusWhenNoTaskHasEverRun(): void
    {
        BackgroundTaskHelper::cleanup(SystemController::TASK_DIAGNOSTICS);

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getDiagnosticsStatus']);

        $this->assertNull($result['error']);
        $this->assertFalse($result['data']['status']);
        $this->assertFalse($result['data']['completed']);
    }

    // -----------------------------------------------------------------
    // getServices
    // -----------------------------------------------------------------

    public function testGetServicesReturnsASortedListWithEnabledAndRunningState(): void
    {
        $scandir = $this->getFunctionMock(__NAMESPACE__, 'scandir');
        $scandir->expects($this->once())->with('/etc/init.d')->willReturn(['.', '..', 'dropbear', 'cron', 'bogus']);

        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->exactly(3))->willReturnCallback(function ($path) {
            return $path !== '/etc/init.d/bogus';
        });

        $glob = $this->getFunctionMock(__NAMESPACE__, 'glob');
        $glob->expects($this->once())->with('/etc/rc.d/S*')->willReturn(['/etc/rc.d/S50cron']);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [json_encode(['dropbear' => []])];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getServices']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'services' => [
                ['name' => 'cron', 'enabled' => true, 'running' => false],
                ['name' => 'dropbear', 'enabled' => false, 'running' => true],
            ],
        ], $result['data']);
    }

    public function testGetServicesReturnsAnEmptyListWhenScandirFails(): void
    {
        $scandir = $this->getFunctionMock(__NAMESPACE__, 'scandir');
        $scandir->expects($this->once())->willReturn(false);

        $result = $this->dispatch(SystemController::class, 'system', ['action' => 'getServices']);

        $this->assertNull($result['error']);
        $this->assertSame(['services' => []], $result['data']);
    }

    // -----------------------------------------------------------------
    // controlService
    // -----------------------------------------------------------------

    public function testControlServiceRestartsAnExistingServiceAndReturnsItsNewState(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->with('/etc/init.d/cron')->willReturn(true);

        $glob = $this->getFunctionMock(__NAMESPACE__, 'glob');
        $glob->expects($this->once())->willReturn(['/etc/rc.d/S50cron']);

        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $output = str_contains($command, 'ubus') ? [json_encode(['cron' => []])] : [];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'controlService',
            'name' => 'cron',
            'command' => 'restart',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['name' => 'cron', 'enabled' => true, 'running' => true], $result['data']);
        $this->assertSame('/etc/init.d/cron restart', $capturedCommands[0]);
    }

    /**
     * The service name is used to build a literal `/etc/init.d/{name} {command}`
     * shell command. resolveServiceName() whitelists it against
     * SERVICE_NAME_REGEX (`^[a-zA-Z0-9_.-]+$`) *before* anything ever reaches
     * exec() — a payload with shell metacharacters is rejected outright, and
     * no command is executed at all.
     */
    public function testControlServiceRejectsAMaliciousServiceNameWithoutExecutingAnyCommand(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'controlService',
            'name' => 'cron; rm -rf /',
            'command' => 'restart',
        ]);

        $this->assertSame('Invalid service', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testControlServiceRejectsAServiceNameThatHasNoInitScript(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->with('/etc/init.d/not-a-real-service')->willReturn(false);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'controlService',
            'name' => 'not-a-real-service',
            'command' => 'restart',
        ]);

        $this->assertSame('Invalid service', $result['error']);
    }

    public function testControlServiceRejectsAnUnsupportedCommand(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->willReturn(true);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'controlService',
            'name' => 'cron',
            'command' => 'reload',
        ]);

        $this->assertSame('Unsupported command', $result['error']);
    }

    public function testControlServiceReturnsErrorWhenTheInitScriptCommandFails(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->willReturn(true);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'controlService',
            'name' => 'cron',
            'command' => 'stop',
        ]);

        $this->assertSame('Failed to stop cron', $result['error']);
    }

    // -----------------------------------------------------------------
    // toggleEnabled
    // -----------------------------------------------------------------

    public function testToggleEnabledEnablesAnExistingServiceAndReturnsItsNewState(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->with('/etc/init.d/cron')->willReturn(true);

        $glob = $this->getFunctionMock(__NAMESPACE__, 'glob');
        $glob->expects($this->once())->willReturn(['/etc/rc.d/S50cron']);

        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $output = str_contains($command, 'ubus') ? [json_encode(['cron' => []])] : [];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'toggleEnabled',
            'name' => 'cron',
            'enabled' => true,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['name' => 'cron', 'enabled' => true, 'running' => true], $result['data']);
        $this->assertSame('/etc/init.d/cron enable', $capturedCommands[0]);
    }

    public function testToggleEnabledDisablesWhenTheEnabledFlagIsMissing(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->willReturn(true);

        $glob = $this->getFunctionMock(__NAMESPACE__, 'glob');
        $glob->expects($this->once())->willReturn([]);

        $capturedCommands = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands) {
            $capturedCommands[] = $command;
            $output = str_contains($command, 'ubus') ? [json_encode([])] : [];
            $retval = 0;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'toggleEnabled',
            'name' => 'cron',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['name' => 'cron', 'enabled' => false, 'running' => false], $result['data']);
        $this->assertSame('/etc/init.d/cron disable', $capturedCommands[0]);
    }

    /**
     * Same whitelist as controlService() (both funnel through
     * resolveServiceName()) — a path-traversal-flavoured payload is rejected
     * before any command runs.
     */
    public function testToggleEnabledRejectsAMaliciousServiceNameWithoutExecutingAnyCommand(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->never());

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'toggleEnabled',
            'name' => '../../etc/passwd',
            'enabled' => true,
        ]);

        $this->assertSame('Invalid service', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testToggleEnabledReturnsErrorWhenTheInitScriptCommandFails(): void
    {
        $isFile = $this->getFunctionMock(__NAMESPACE__, 'is_file');
        $isFile->expects($this->once())->willReturn(true);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(SystemController::class, 'system', [
            'action' => 'toggleEnabled',
            'name' => 'cron',
            'enabled' => false,
        ]);

        $this->assertSame('Failed to disable cron', $result['error']);
    }
}
