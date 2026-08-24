<?php
/*
 * Project: Frieren Framework
 * Tests for the `modules` module (ModulesController) — the third-party module
 * manager: list/scan installed modules, fetch the remote catalog, download,
 * verify, install/remove/pin modules on internal or SD storage.
 *
 * Mocking notes:
 * - Shell-outs (`exec`) reached through OpenWrtHelper/UciConfigHelper/
 *   BackgroundTaskHelper are mocked in `frieren\helper` (that's the namespace
 *   the unqualified `exec()` call actually resolves against), same technique
 *   as HeaderControllerTest/OpenWrtHelperTest.
 * - `checkDestination()` calls `disk_free_space()` unqualified from
 *   ModulesController itself, so that one is mocked in this controller's own
 *   namespace, `frieren\modules\modules`.
 * - `getModuleList()`/`getInstalledModules()` scan
 *   `\DeviceConfig::MODULE_ROOT_FOLDER` via `new \DirectoryIterator(...)`. That
 *   constant is a hardcoded '/frieren/modules' class const (no injection seam)
 *   and DirectoryIterator is a class, not a mockable global function, so unlike
 *   every other read here this one can't be pointed at a fixture. See the two
 *   tests below for what that means in practice.
 */

namespace frieren\modules\modules;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;
use frieren\helper\BackgroundTaskHelper;

class ModulesControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cleanupFixtures();
    }

    protected function tearDown(): void
    {
        $this->cleanupFixtures();
        parent::tearDown();
    }

    private function cleanupFixtures(): void
    {
        @unlink(BackgroundTaskHelper::getFlagPath(ModulesController::TASK_DOWNLOAD));
        @unlink(BackgroundTaskHelper::getFlagPath(ModulesController::TASK_INSTALL));
        @unlink('/tmp/demo.tar.gz');
        @unlink('/tmp/orphan/evil.tar.gz');
        @rmdir('/tmp/orphan');
    }

    // ---- getModuleList ----------------------------------------------------

    public function testGetModuleListThrowsWhenTheHardcodedModulesRootIsMissing(): void
    {
        // DeviceConfig::MODULE_ROOT_FOLDER is a hardcoded '/frieren/modules' const
        // with no injection seam, and getModuleList() reads it via
        // `new \DirectoryIterator(...)` rather than a wrappable function like
        // scandir(). On any host where that folder doesn't exist (true here; on a
        // real device the OS image guarantees it), the constructor throws before
        // the `isReadable()` guard ever runs, and nothing in ModulesController or
        // Controller::handleActions() catches it — only ApiCore::handleRequest()'s
        // top-level try/catch does, and DispatchesControllers::dispatch() bypasses
        // ApiCore entirely by constructing the controller directly. This test pins
        // that real, current behavior; the happy-path scan/shape isn't exercisable
        // here without a filesystem fixture at that exact absolute path.
        $this->expectException(\UnexpectedValueException::class);

        $this->dispatch(ModulesController::class, 'modules', ['action' => 'getModuleList']);
    }

    // ---- getAvailableModules ------------------------------------------------

    public function testGetAvailableModulesFailsWithoutInternetConnection(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'getAvailableModules']);

        $this->assertSame('No internet connection available.', $result['error']);
    }

    public function testGetAvailableModulesReturnsTheDecodedRemoteCatalogWhenOnline(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [];
            $retval = 0;
        });

        $catalogJson = json_encode([
            [
                'name' => 'wpaonlinecrack',
                'title' => 'WPA Online Crack',
                'version' => '1.1.0',
                'checksum' => '5d5b46edb5080193cd0160f80ea28183788217665318e7ff5cf2840c2d26ed73',
                'size' => 12133,
            ],
        ]);
        $fileGetContents = $this->getFunctionMock('frieren\helper', 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturn($catalogJson);

        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'getAvailableModules']);

        $this->assertNull($result['error']);
        $this->assertIsArray($result['data']);
        $this->assertCount(1, $result['data']);
        $this->assertSame('wpaonlinecrack', $result['data'][0]->name);
        $this->assertSame('1.1.0', $result['data'][0]->version);
    }

    // ---- getInstalledModules ------------------------------------------------

    public function testGetInstalledModulesThrowsWhenTheHardcodedModulesRootIsMissing(): void
    {
        // See testGetModuleListThrowsWhenTheHardcodedModulesRootIsMissing() above
        // for why this pins current behavior instead of the happy-path shape.
        $this->expectException(\UnexpectedValueException::class);

        $this->dispatch(ModulesController::class, 'modules', ['action' => 'getInstalledModules']);
    }

    // ---- downloadModule / downloadStatus ------------------------------------

    public function testDownloadModuleFailsWithoutInternetConnection(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'downloadModule',
            'moduleName' => 'demo',
            'version' => '1.3.1',
        ]);

        $this->assertSame('No internet connection available.', $result['error']);
    }

    public function testDownloadModuleTriggersTheBackgroundDownloadWhenOnline(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            if (str_contains($command, 'ping')) {
                $output = [];
                $retval = 0;
            }
        });

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'downloadModule',
            'moduleName' => 'demo',
            'version' => '1.3.1',
        ]);

        $this->assertNull($result['error']);
        $this->assertTrue($result['data']['success']);
        $this->assertStringContainsString('demo-1.3.1.tar.gz', $result['data']['url']);
        $this->assertStringContainsString('demo-1.3.1.tar.gz', $captured[1], 'the remote (versioned) filename is fetched');
        $this->assertStringContainsString('/tmp/demo.tar.gz', $captured[1], 'saved under the local (unversioned) filename');
        $this->assertStringStartsWith('/usr/bin/nohup', $captured[1]);
    }

    public function testDownloadStatusReflectsTheBackgroundFlagFile(): void
    {
        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'downloadStatus']);
        $this->assertFalse($result['data']['completed']);

        touch(BackgroundTaskHelper::getFlagPath(ModulesController::TASK_DOWNLOAD));

        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'downloadStatus']);
        $this->assertTrue($result['data']['completed']);
    }

    // ---- installModule / installStatus --------------------------------------

    public function testInstallModuleFailsOnChecksumMismatch(): void
    {
        file_put_contents('/tmp/demo.tar.gz', 'fake-archive-content');

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'installModule',
            'moduleName' => 'demo',
            'checksum' => 'not-the-real-checksum',
            'destination' => 'internal',
        ]);

        $this->assertSame('Checksum mismatch', $result['error']);
    }

    public function testInstallModuleStartsExtractionInTheBackgroundWhenChecksumMatches(): void
    {
        $filePath = '/tmp/demo.tar.gz';
        file_put_contents($filePath, 'fake-archive-content');
        $checksum = hash_file('sha256', $filePath);

        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'installModule',
            'moduleName' => 'demo',
            'checksum' => $checksum,
            'destination' => 'internal',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('tar -xzC', $captured);
        $this->assertStringContainsString(escapeshellarg($filePath), $captured);
    }

    public function testInstallModuleChecksumLookupIsReachableViaPathTraversalBeforeNameValidation(): void
    {
        // BUG (real, current behavior): installModule() builds
        // "/tmp/{moduleName}.tar.gz" and runs hash_file() on it *before* the
        // moduleName is ever validated — the '^[a-zA-Z0-9_-]+$' whitelist only
        // lives in removeModuleFiles(), called afterwards. A moduleName carrying
        // a path separator (or "../") is concatenated as-is, so the checksum
        // lookup escapes the intended flat /tmp/{moduleName}.tar.gz layout and
        // can read/hash an arbitrary file the web server user can access. That's
        // an existence/content oracle: an attacker who can already guess a
        // target file's sha256 can confirm it matches without further access.
        // It's not a write primitive — removeModuleFiles() still rejects the
        // traversal-bearing name right after and (in production, one layer up)
        // ApiCore turns that uncaught Exception into a normal JSON error — but
        // the checksum step itself operates on an unsanitized path first.
        $trapDir = '/tmp/orphan';
        @mkdir($trapDir, 0777, true);
        $trapFile = "{$trapDir}/evil.tar.gz";
        file_put_contents($trapFile, 'not a real module, just a marker file');
        $checksum = hash_file('sha256', $trapFile);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid module name');

        $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'installModule',
            'moduleName' => 'orphan/evil',
            'checksum' => $checksum,
            'destination' => 'internal',
        ]);
    }

    public function testInstallStatusReflectsTheBackgroundFlagFile(): void
    {
        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'installStatus']);
        $this->assertFalse($result['data']['completed']);

        touch(BackgroundTaskHelper::getFlagPath(ModulesController::TASK_INSTALL));

        $result = $this->dispatch(ModulesController::class, 'modules', ['action' => 'installStatus']);
        $this->assertTrue($result['data']['completed']);
    }

    // ---- checkDestination -----------------------------------------------------

    public function testCheckDestinationReportsInternalStorageAvailableWhenNotAlreadyInstalled(): void
    {
        $diskFreeSpace = $this->getFunctionMock(__NAMESPACE__, 'disk_free_space');
        $diskFreeSpace->expects($this->once())->willReturn(100 * 1024 * 1024);

        $fileGetContents = $this->getFunctionMock('frieren\helper', 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturn("/dev/root / ext4 rw 0 0\n");

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'checkDestination',
            'moduleName' => 'demo',
            'moduleSize' => 1024,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame([
            'alreadyInstalled' => false,
            'isInternalAvailable' => true,
            'isSDAvailable' => false,
        ], $result['data']);
    }

    public function testCheckDestinationReportsSDAvailableWhenInternalSpaceIsInsufficient(): void
    {
        $diskFreeSpace = $this->getFunctionMock(__NAMESPACE__, 'disk_free_space');
        $diskFreeSpace->expects($this->once())->willReturn(500000);

        $fileGetContents = $this->getFunctionMock('frieren\helper', 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturn("/dev/mmcblk0p1 /sd ext4 rw 0 0\n");

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'checkDestination',
            'moduleName' => 'demo',
            'moduleSize' => 500000000,
        ]);

        $this->assertNull($result['error']);
        $this->assertFalse($result['data']['isInternalAvailable']);
        $this->assertTrue($result['data']['isSDAvailable']);
    }

    // ---- removeModule -----------------------------------------------------

    public function testRemoveModuleRejectsPathTraversalInTheModuleName(): void
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Invalid module name');

        $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'removeModule',
            'moduleName' => '../../etc',
        ]);
    }

    public function testRemoveModuleSucceedsWhenNothingIsInstalledUnderThatName(): void
    {
        // Neither /frieren/modules/<name> nor /sd/modules/<name> exist for this
        // name, so is_link()/is_dir() are both false and no exec() is ever run —
        // no mocking needed, this is a real filesystem no-op.
        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'removeModule',
            'moduleName' => 'nonexistent-demo-module',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    // ---- pinModule ----------------------------------------------------------

    public function testPinModuleAddsTheModuleToTheSidebarSettings(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$exitCode = null) use (&$captured) {
            $captured[] = $command;
            $exitCode = 0;
            if (str_starts_with($command, 'uci -q get')) {
                return json_encode(['existing' => true]);
            }
            return '';
        });

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'pinModule',
            'moduleName' => 'demo',
            'status' => 'pin',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringStartsWith('uci -q get', $captured[0]);
        $this->assertStringContainsString('"existing":true', $captured[1]);
        $this->assertStringContainsString('"demo":true', $captured[1]);
        $this->assertStringStartsWith('uci commit', $captured[2]);
    }

    public function testPinModuleRemovesTheModuleFromTheSidebarSettings(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$exitCode = null) use (&$captured) {
            $captured[] = $command;
            $exitCode = 0;
            if (str_starts_with($command, 'uci -q get')) {
                return json_encode(['demo' => true, 'existing' => true]);
            }
            return '';
        });

        $result = $this->dispatch(ModulesController::class, 'modules', [
            'action' => 'pinModule',
            'moduleName' => 'demo',
            'status' => 'unpin',
        ]);

        $this->assertNull($result['error']);
        $this->assertStringContainsString('"existing":true', $captured[1]);
        $this->assertStringNotContainsString('demo', $captured[1]);
    }
}
