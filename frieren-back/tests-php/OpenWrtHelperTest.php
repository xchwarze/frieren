<?php
/*
 * Project: Frieren Framework
 * Tests for OpenWrtHelper — mocks the single global `exec()` call inside
 * `namespace frieren\helper` (via php-mock/php-mock-phpunit) so these run on any
 * host, not just a real OpenWrt device.
 */

namespace frieren\helper;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;

class OpenWrtHelperTest extends TestCase
{
    use PHPMock;

    public function testCheckRunningEscapesTheProcessNameArgument(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null) use (&$captured) {
            $captured = $command;
            $output = ['12345'];
        });

        $result = OpenWrtHelper::checkRunning("innocent'; rm -rf /");

        $this->assertTrue($result);
        $this->assertStringContainsString(escapeshellarg("innocent'; rm -rf /"), $captured);
        $this->assertStringStartsWith('/usr/bin/pgrep ', $captured);
    }

    public function testCheckRunningWithFullPathUsesPgrepDashF(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null) use (&$captured) {
            $captured = $command;
            $output = [];
        });

        $result = OpenWrtHelper::checkRunning('/usr/sbin/hcxdumptool', true);

        $this->assertFalse($result, 'No matching lines means the process is not running');
        $this->assertStringStartsWith('/usr/bin/pgrep -f ', $captured);
    }

    public function testCheckDependencyReportsOnlyTheMissingPackagesByName(): void
    {
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = [
                'Package: curl',
                'Version: 8.0.1-1',
                'Package: hcxtools',
                'Version: 6.3.0-1',
            ];
            $retval = 0;
        });

        $missing = OpenWrtHelper::checkDependency(['curl', 'hcxtools', 'aircrack-ng']);

        $this->assertIsString($missing, 'A missing dependency must be reported as a message string');
        $this->assertStringContainsString('aircrack-ng', $missing);
        $this->assertStringNotContainsString('curl', $missing);
        $this->assertStringNotContainsString('hcxtools', $missing);
    }

    public function testCheckDependencyReturnsTrueWhenEverythingIsInstalled(): void
    {
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = ['Package: curl', 'Package: hcxtools'];
            $retval = 0;
        });

        $result = OpenWrtHelper::checkDependency(['curl', 'hcxtools']);

        $this->assertTrue($result);
    }

    public function testInstallDependencyEscapesEachPackageNameIndividually(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        // installDependency ultimately reaches OpenWrtHelper::execBackground(), whose
        // single exec() call in this namespace is the one intercepted above.
        OpenWrtHelper::installDependency('curl hcxtools', false, 'phpunit-install-test-' . uniqid());

        $this->assertStringContainsString(escapeshellarg('curl'), $captured);
        $this->assertStringContainsString(escapeshellarg('hcxtools'), $captured);
        $this->assertStringContainsString('packages/bin/dependency-installer.sh', $captured);
        $this->assertStringNotContainsString('--dest sd', $captured);
    }

    public function testInstallDependencyToSDPassesTheDestFlag(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        OpenWrtHelper::installDependency('curl', true, 'phpunit-install-sd-test-' . uniqid());

        $this->assertStringContainsString('--dest sd ', $captured);
    }

    public function testLoggerFallsBackToErrForAnUnrecognizedLevel(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        OpenWrtHelper::logger('something happened', 'not-a-real-level');

        $this->assertStringContainsString('user.err', $captured);
    }

    public function testHasInternetConnectionReflectsThePingExitCode(): void
    {
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // ping failed -> exec() wrapper returns false
        });

        $this->assertFalse(OpenWrtHelper::hasInternetConnection());
    }
}
