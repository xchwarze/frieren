<?php
/*
 * Project: Frieren Framework — module template
 * Example Controller-level test: dispatches a real action through the real
 * \frieren\core\Controller base class (from the frieren/back path dependency)
 * and reads the response back via the shared DispatchesControllers trait.
 */

namespace frieren\modules\demo;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\modules\demo\Tests\Support\DispatchesControllers;

class DemoControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    public function testGetSystemStatsReturnsComputedPercentagesOnSuccess(): void
    {
        $ubusJson = json_encode([
            'load' => [65536, 0, 0],
            'memory' => ['total' => 1000, 'free' => 500, 'buffered' => 0, 'cached' => 0],
            'swap' => ['total' => 200, 'free' => 100],
            'uptime' => 120,
            'localtime' => 1700000000,
        ]);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use ($ubusJson) {
            $output = [$ubusJson];
            $retval = 0;
        });

        $procStat = $this->getFunctionMock('frieren\modules\demo', 'file');
        $procStat->expects($this->once())->willReturn(["cpu 0 0 0 0\n", "cpu0 0 0 0 0\n"]);

        $result = $this->dispatch(DemoController::class, 'demo', ['action' => 'getSystemStats']);

        $this->assertNull($result['error']);
        $this->assertSame(1, $result['data']['cpu_cores']);
        $this->assertSame('100%', $result['data']['cpu_usage']);  // 1.0 load average / 1 core = fully loaded
        $this->assertSame('50%', $result['data']['memory_used']); // (1000-500)/1000
        $this->assertSame('50%', $result['data']['swap_used']);   // (200-100)/200
        $this->assertSame('00:02 hrs', $result['data']['uptime']); // 120s = 0h 2m
    }

    public function testGetSystemStatsReturnsAnErrorWhenTheHelperFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(DemoController::class, 'demo', ['action' => 'getSystemStats']);

        $this->assertNotNull($result['error']);
        $this->assertNull($result['data']);
    }

    public function testUnknownActionReturnsTheFrameworkSuppliedError(): void
    {
        $result = $this->dispatch(DemoController::class, 'demo', ['action' => 'notARealAction']);

        $this->assertSame('Unknown action', $result['error']);
    }
}
