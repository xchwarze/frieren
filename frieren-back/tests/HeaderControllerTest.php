<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `header` module (shutdown/reboot/ping). Doubles as the
 * sanity check for tests/Support/DispatchesControllers.php, since it's the
 * simplest real controller in the framework.
 */

namespace frieren\modules\header;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class HeaderControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    protected function tearDown(): void
    {
        unset($_SESSION['user_logged']);
        parent::tearDown();
    }

    public function testServerPingSucceedsWhenSessionIsAuthenticated(): void
    {
        $_SESSION['user_logged'] = true;

        $result = $this->dispatch(HeaderController::class, 'header', ['action' => 'serverPing']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    public function testServerPingFailsWhenSessionIsNotAuthenticated(): void
    {
        unset($_SESSION['user_logged']);

        $result = $this->dispatch(HeaderController::class, 'header', ['action' => 'serverPing']);

        $this->assertSame('Not Authenticated', $result['error']);
    }

    public function testShutDownHardwareRunsPoweroffInTheBackground(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatch(HeaderController::class, 'header', ['action' => 'shutDownHardware']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('poweroff', $captured);
        $this->assertStringStartsWith('/usr/bin/nohup ', $captured);
    }

    public function testResetHardwareRunsRebootInTheBackground(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        $result = $this->dispatch(HeaderController::class, 'header', ['action' => 'resetHardware']);

        $this->assertNull($result['error']);
        $this->assertStringContainsString('reboot', $captured);
    }

    public function testUnknownActionReturnsTheFrameworkSuppliedError(): void
    {
        $result = $this->dispatch(HeaderController::class, 'header', ['action' => 'notARealAction']);

        $this->assertSame('Unknown action', $result['error']);
    }

    public function testMissingActionReturnsTheFrameworkSuppliedError(): void
    {
        $result = $this->dispatch(HeaderController::class, 'header', []);

        $this->assertSame('No action was specified', $result['error']);
    }
}
