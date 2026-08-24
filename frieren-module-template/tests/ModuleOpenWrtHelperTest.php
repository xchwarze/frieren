<?php
/*
 * Project: Frieren Framework — module template
 * Example tests for the scaffolded ModuleOpenWrtHelper: a pure-logic method
 * needs no mocking at all, and the ubus/exec-touching method is verified by
 * mocking the underlying global functions where they're actually called.
 */

namespace frieren\modules\demo;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;

class ModuleOpenWrtHelperTest extends TestCase
{
    use PHPMock;

    public function testSecondsToUptimeFormatsDaysHoursAndMinutes(): void
    {
        $this->assertSame('2d 03:04 hrs', ModuleOpenWrtHelper::secondsToUptime(2 * 86400 + 3 * 3600 + 4 * 60));
    }

    public function testSecondsToUptimeFormatsHoursAndMinutesWithoutDays(): void
    {
        $this->assertSame('05:09 hrs', ModuleOpenWrtHelper::secondsToUptime(5 * 3600 + 9 * 60));
    }

    public function testSecondsToUptimeFormatsPlainSecondsUnderAMinute(): void
    {
        $this->assertSame('42 sec', ModuleOpenWrtHelper::secondsToUptime(42));
    }

    public function testGetUbusSystemInfoComputesCoresLoadMemoryAndSwapFromTheUbusPayload(): void
    {
        // execUbusCall() -> OpenWrtHelper::exec() -> the raw exec() inside
        // `frieren\helper`; getUbusSystemInfo() also calls file('/proc/stat')
        // unqualified, resolving inside this class's own `frieren\modules\demo`
        // namespace — two different namespaces to mock.
        $ubusJson = json_encode([
            'load' => [65536, 0, 0], // 1.0 raw load average, scaled by SYSTEM_LOAD_SCALE_FACTOR
            'memory' => ['total' => 1000, 'free' => 200, 'buffered' => 50, 'cached' => 50],
            'swap' => ['total' => 500, 'free' => 500],
            'uptime' => 3661, // 1h 1m 1s
            'localtime' => 1700000000,
        ]);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use ($ubusJson) {
            $output = [$ubusJson];
            $retval = 0;
        });

        $procStat = $this->getFunctionMock(__NAMESPACE__, 'file');
        $procStat->expects($this->once())->willReturn(["cpu 100 0 0 0\n", "cpu0 50 0 0 0\n", "cpu1 50 0 0 0\n"]);

        $result = ModuleOpenWrtHelper::getUbusSystemInfo();

        $this->assertSame(2, $result['total_cores'], 'Only "cpu0"/"cpu1" lines count, not the aggregate "cpu" line');
        $this->assertSame(50.0, $result['load'], '1.0 raw load / 2 cores * 100 = 50%');
        $this->assertSame(700, $result['memory_used'], '1000 - 200 free - 50 buffered - 50 cached');
        $this->assertSame(1000, $result['memory_total']);
        $this->assertSame(0, $result['swap_used']);
        $this->assertSame(500, $result['swap_total']);
        $this->assertSame('01:01 hrs', $result['uptime']);
        $this->assertSame(date('Y-m-d H:i:s', 1700000000), $result['localtime']);
    }

    public function testGetUbusSystemInfoReturnsFalseWhenTheUbusCallFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // non-zero exit -> OpenWrtHelper::exec() returns false -> execUbusCall() returns false
        });

        $this->assertFalse(ModuleOpenWrtHelper::getUbusSystemInfo());
    }
}
