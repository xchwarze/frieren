<?php
/*
 * Project: Frieren Framework
 * Tests for the `packages` module (opkg/apk package management). Every action
 * either polls a BackgroundTaskHelper flag/log pair (real /tmp files, no mock
 * needed) or kicks one off via OpenWrtHelper::exec()/execBackground(), whose
 * single unqualified `exec()` call lives in the `frieren\helper` namespace and
 * is mocked via php-mock-phpunit. installPackage()/removePackage() interpolate
 * the user-supplied packageName into a shell command, so the escapeshellarg()
 * tests below double as the command-injection regression check called out in
 * specs/api-design.spec.md §6.
 */

namespace frieren\modules\packages;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Controller;
use frieren\helper\BackgroundTaskHelper;
use frieren\core\Tests\Support\DispatchesControllers;

class PackagesControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    /** @var string[] All BackgroundTaskHelper task names this controller ever touches on disk. */
    private const ALL_TASKS = [
        PackagesController::TASK_UPDATE,
        PackagesController::TASK_INSTALLED,
        PackagesController::TASK_AVAILABLE,
        PackagesController::TASK_INSTALL,
        PackagesController::TASK_REMOVE,
        Controller::TASK_DEPENDENCIES,
    ];

    protected function setUp(): void
    {
        parent::setUp();
        foreach (self::ALL_TASKS as $task) {
            BackgroundTaskHelper::cleanup($task);
        }
    }

    protected function tearDown(): void
    {
        foreach (self::ALL_TASKS as $task) {
            BackgroundTaskHelper::cleanup($task);
        }
        parent::tearDown();
    }

    private function dispatchPackages(array $request): array
    {
        return $this->dispatch(PackagesController::class, 'packages', $request);
    }

    private function markDependencyInstallRunning(): void
    {
        // isRunning() == log exists but flag doesn't.
        file_put_contents(BackgroundTaskHelper::getLogPath(Controller::TASK_DEPENDENCIES), "installing\n");
    }

    // ---- updateLists / getUpdateStatus ----------------------------------

    public function testUpdateListsFailsWhenDependencyInstallationIsInProgress(): void
    {
        $this->markDependencyInstallRunning();

        // No exec() mock registered: if the code reached hasInternetConnection() or
        // BackgroundTaskHelper::start() it would call the real global exec(), which
        // would fail this test loudly rather than silently passing.
        $result = $this->dispatchPackages(['action' => 'updateLists']);

        $this->assertSame(
            'A module dependency installation is in progress. Please wait until it finishes.',
            $result['error']
        );
    }

    public function testUpdateListsFailsWhenNoInternetConnection(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // ping failed
        });

        $result = $this->dispatchPackages(['action' => 'updateLists']);

        $this->assertSame('No internet connection available.', $result['error']);
    }

    public function testUpdateListsStartsBackgroundTaskWhenOnline(): void
    {
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $retval = 0;
            $output = [];
        });

        $result = $this->dispatchPackages(['action' => 'updateLists']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('package-manager-call.sh update', $captured[1]);
        $this->assertStringStartsWith('/usr/bin/nohup sh -c', $captured[1]);
        $this->assertStringContainsString(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_UPDATE), $captured[1]);
    }

    public function testGetUpdateStatusReflectsRealBackgroundTaskFiles(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath(PackagesController::TASK_UPDATE), "Downloaded lists\n");
        touch(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_UPDATE));

        $result = $this->dispatchPackages(['action' => 'getUpdateStatus']);

        $this->assertNull($result['error']);
        $this->assertSame(['completed' => true, 'output' => "Downloaded lists\n"], $result['data']);
    }

    public function testGetUpdateStatusWhenIdle(): void
    {
        $result = $this->dispatchPackages(['action' => 'getUpdateStatus']);

        $this->assertSame(['completed' => false, 'output' => ''], $result['data']);
    }

    // ---- getInstalledPackages / getInstalledPackagesStatus --------------

    public function testGetInstalledPackagesParsesTheOpkgControlFileFormat(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            // Simulates package-manager-call.sh writing opkg control-file output
            // to the redirected log path; exec() itself is mocked so nothing runs.
            file_put_contents(
                BackgroundTaskHelper::getLogPath(PackagesController::TASK_INSTALLED),
                "Package: terminfo\nVersion: 6.4-r2\nDescription: \n\n" .
                "Package: iwinfo\nVersion: 2024.10.20~b94f066e-r1\nDescription: \n"
            );
            $retval = 0;
            $output = [];
        });

        $result = $this->dispatchPackages(['action' => 'getInstalledPackages']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'packages' => [
                ['name' => 'terminfo', 'version' => '6.4-r2', 'description' => ''],
                ['name' => 'iwinfo', 'version' => '2024.10.20~b94f066e-r1', 'description' => ''],
            ],
        ], $result['data']);
    }

    public function testGetInstalledPackagesStatusWhenNotYetCompleted(): void
    {
        $result = $this->dispatchPackages(['action' => 'getInstalledPackagesStatus']);

        $this->assertSame(['completed' => false, 'packages' => []], $result['data']);
    }

    public function testGetInstalledPackagesStatusParsesTheRealLogFileOnceCompleted(): void
    {
        file_put_contents(
            BackgroundTaskHelper::getLogPath(PackagesController::TASK_INSTALLED),
            "Package: terminfo\nVersion: 6.4-r2\nDescription: \n"
        );
        touch(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_INSTALLED));

        $result = $this->dispatchPackages(['action' => 'getInstalledPackagesStatus']);

        $this->assertSame([
            'completed' => true,
            'packages' => [
                ['name' => 'terminfo', 'version' => '6.4-r2', 'description' => ''],
            ],
        ], $result['data']);
    }

    // ---- getAvailablePackages / getAvailablePackagesStatus ---------------

    public function testGetAvailablePackagesStartsBackgroundTaskWithNoPriorChecks(): void
    {
        // Unlike updateLists/installPackage/removePackage, this action has no
        // dependency-install or internet-connection guard, so exactly one exec()
        // call is expected (execBackground()'s), not two.
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatchPackages(['action' => 'getAvailablePackages']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('package-manager-call.sh list-available', $captured);
    }

    public function testGetAvailablePackagesStatusWhenNotYetCompleted(): void
    {
        $result = $this->dispatchPackages(['action' => 'getAvailablePackagesStatus']);

        $this->assertSame(['completed' => false, 'packages' => []], $result['data']);
    }

    public function testGetAvailablePackagesStatusParsesTheRealLogFileOnceCompleted(): void
    {
        file_put_contents(
            BackgroundTaskHelper::getLogPath(PackagesController::TASK_AVAILABLE),
            "Package: iwinfo\nVersion: 2024.10.20~b94f066e-r1\nDescription: \n"
        );
        touch(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_AVAILABLE));

        $result = $this->dispatchPackages(['action' => 'getAvailablePackagesStatus']);

        $this->assertSame([
            'completed' => true,
            'packages' => [
                ['name' => 'iwinfo', 'version' => '2024.10.20~b94f066e-r1', 'description' => ''],
            ],
        ], $result['data']);
    }

    // ---- installPackage / getInstallStatus -------------------------------

    public function testInstallPackageFailsWhenDependencyInstallationIsInProgress(): void
    {
        $this->markDependencyInstallRunning();

        $result = $this->dispatchPackages(['action' => 'installPackage', 'packageName' => 'curl']);

        $this->assertSame(
            'A module dependency installation is in progress. Please wait until it finishes.',
            $result['error']
        );
    }

    public function testInstallPackageFailsWhenNoInternetConnection(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatchPackages(['action' => 'installPackage', 'packageName' => 'curl']);

        $this->assertSame('No internet connection available.', $result['error']);
    }

    public function testInstallPackageEscapesAShellMetacharacterLadenPackageName(): void
    {
        $malicious = 'curl; rm -rf /';
        $captured = [];
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $retval = 0;
            $output = [];
        });

        $result = $this->dispatchPackages(['action' => 'installPackage', 'packageName' => $malicious]);

        $this->assertNull($result['error']);
        $startCommand = $captured[1];
        $this->assertStringContainsString('package-manager-call.sh install', $startCommand);
        // The dangerous payload must only ever appear quoted by escapeshellarg(),
        // never as a bare, shell-interpretable ";".
        $this->assertStringContainsString(escapeshellarg($malicious), $startCommand);
        $this->assertStringNotContainsString('install ' . $malicious, $startCommand);
    }

    public function testGetInstallStatusReflectsRealBackgroundTaskFiles(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath(PackagesController::TASK_INSTALL), "Installing curl\n");
        touch(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_INSTALL));

        $result = $this->dispatchPackages(['action' => 'getInstallStatus']);

        $this->assertSame(['completed' => true, 'output' => "Installing curl\n"], $result['data']);
    }

    // ---- removePackage / getRemoveStatus ---------------------------------

    public function testRemovePackageFailsWhenDependencyInstallationIsInProgress(): void
    {
        $this->markDependencyInstallRunning();

        $result = $this->dispatchPackages(['action' => 'removePackage', 'packageName' => 'curl']);

        $this->assertSame(
            'A module dependency installation is in progress. Please wait until it finishes.',
            $result['error']
        );
    }

    public function testRemovePackageDoesNotRequireInternetAndEscapesThePackageName(): void
    {
        // removePackage has no hasInternetConnection() guard, so only the
        // execBackground() call underneath BackgroundTaskHelper::start() should
        // reach the global exec() -- exactly once.
        $malicious = 'curl; rm -rf /';
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatchPackages(['action' => 'removePackage', 'packageName' => $malicious]);

        $this->assertNull($result['error']);
        $this->assertStringContainsString('package-manager-call.sh remove', $captured);
        $this->assertStringContainsString(escapeshellarg($malicious), $captured);
        $this->assertStringNotContainsString('--autoremove', $captured);
    }

    public function testRemovePackageWithAutoremoveAddsTheForceRemovalFlags(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatchPackages([
            'action' => 'removePackage',
            'packageName' => 'curl',
            'autoremove' => true,
        ]);

        $this->assertNull($result['error']);
        $this->assertStringContainsString(
            "remove --force-removal-of-dependent-packages --autoremove " . escapeshellarg('curl'),
            $captured
        );
    }

    public function testGetRemoveStatusReflectsRealBackgroundTaskFiles(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath(PackagesController::TASK_REMOVE), "Removing curl\n");
        touch(BackgroundTaskHelper::getFlagPath(PackagesController::TASK_REMOVE));

        $result = $this->dispatchPackages(['action' => 'getRemoveStatus']);

        $this->assertSame(['completed' => true, 'output' => "Removing curl\n"], $result['data']);
    }
}
