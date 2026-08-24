<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `dashboard` module. getSystemResume()/getSystemStats()
 * both bottom out in a single `exec()` call inside `frieren\helper` (the ubus
 * invocation); getSystemStats() additionally reads /proc/stat via unqualified
 * fopen()/fgets()/fclose() inside this module's own `frieren\modules\dashboard`
 * namespace. getNews() chains hasInternetConnection() (another `frieren\helper`
 * exec()) with fileGetContentsSSL(), whose openssl branch is forced
 * deterministically here by mocking extension_loaded() + file_get_contents(),
 * also inside `frieren\helper`.
 */

namespace frieren\modules\dashboard;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class DashboardControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    public function testGetSystemStatsReturnsComputedStatsOnSuccess(): void
    {
        $ubusJson = json_encode([
            'load' => [131072, 0, 0], // 2.0 raw load average, scaled by SYSTEM_LOAD_SCALE_FACTOR
            'memory' => ['total' => 4000, 'free' => 1000, 'buffered' => 500, 'cached' => 500],
            'swap' => ['total' => 1000, 'free' => 1000],
            'uptime' => 54480, // 15h 8m
            'localtime' => 1749577158,
        ]);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use ($ubusJson) {
            $output = [$ubusJson];
            $retval = 0;
        });

        // /proc/stat: the aggregate "cpu" line doesn't count, "cpu0".."cpu3" do,
        // and the unrelated "intr" line stops the loop once totalCores > 0.
        $procStatLines = [
            "cpu  100 0 0 0\n",
            "cpu0 25 0 0 0\n",
            "cpu1 25 0 0 0\n",
            "cpu2 25 0 0 0\n",
            "cpu3 25 0 0 0\n",
            "intr 999\n",
        ];

        $fopen = $this->getFunctionMock(__NAMESPACE__, 'fopen');
        $fopen->expects($this->once())->with('/proc/stat', 'r')->willReturn('fake-proc-stat-handle');

        $fgets = $this->getFunctionMock(__NAMESPACE__, 'fgets');
        $fgets->expects($this->exactly(count($procStatLines)))->willReturnOnConsecutiveCalls(...$procStatLines);

        $fclose = $this->getFunctionMock(__NAMESPACE__, 'fclose');
        $fclose->expects($this->once())->willReturn(true);

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getSystemStats']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'cpu_cores' => 4,
            'cpu_usage' => '50%',   // 2.0 load / 4 cores * 100
            'memory_used' => '50%', // (4000-1000-500-500)/4000
            'swap_used' => '0%',    // (1000-1000)/1000
            'uptime' => '15:08 hrs',
            'localtime' => date('Y-m-d H:i:s', 1749577158),
        ], $result['data']);
    }

    public function testGetSystemStatsReturnsErrorWhenTheUbusCallFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // non-zero exit -> OpenWrtHelper::exec() returns false -> execUbusCall() returns false
        });

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getSystemStats']);

        $this->assertNotNull($result['error']);
        $this->assertNull($result['data']);
    }

    public function testGetSystemResumeReturnsBoardInfoOnSuccess(): void
    {
        $boardJson = json_encode([
            'kernel' => '6.6.127',
            'hostname' => 'frieren',
            'system' => 'MediaTek MT7621 ver:1 eco:3',
            'model' => 'GL.iNet GL-MT1300',
            'board_name' => 'glinet,gl-mt1300',
            'rootfs_type' => 'squashfs',
            'release' => [
                'distribution' => 'OpenWrt',
                'version' => '24.10.6',
                'revision' => 'r29141-81be8a8869',
                'target' => 'ramips/mt7621',
                'description' => 'OpenWrt 24.10.6 r29141-81be8a8869',
                'builddate' => '1773709139',
            ],
        ]);

        $captured = null;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured, $boardJson) {
            $captured = $command;
            $output = [$boardJson];
            $retval = 0;
        });

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getSystemResume']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'kernel' => '6.6.127',
            'hostname' => 'frieren',
            'system' => 'MediaTek MT7621 ver:1 eco:3',
            'model' => 'GL.iNet GL-MT1300',
            'board_name' => 'glinet,gl-mt1300',
            'rootfs_type' => 'squashfs',
            'release' => [
                'distribution' => 'OpenWrt',
                'version' => '24.10.6',
                'revision' => 'r29141-81be8a8869',
                'target' => 'ramips/mt7621',
                'description' => 'OpenWrt 24.10.6 r29141-81be8a8869',
                'builddate' => '1773709139',
            ],
        ], $result['data']);
        $this->assertStringContainsString(escapeshellarg('board'), $captured);
    }

    public function testGetSystemResumeReturnsErrorWhenTheUbusCallFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
        });

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getSystemResume']);

        $this->assertNotNull($result['error']);
        $this->assertNull($result['data']);
    }

    public function testGetNewsReturnsErrorWhenThereIsNoInternetConnection(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1; // ping failed
        });

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getNews']);

        $this->assertSame('No internet connection available.', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testGetNewsReturnsParsedNewsOnSuccess(): void
    {
        $newsJson = json_encode([
            'news' => [
                ['date' => '2026-06-04', 'title' => 'Example news', 'description' => 'Example description'],
            ],
            'lastVersion' => [
                'version' => '1.3.0',
                'comment' => 'Bugfixes and improvements',
                'updateUrl' => 'https://example.com/update.sh',
            ],
        ]);

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = ['1 packets transmitted, 1 received']; // OpenWrtHelper::exec() merges this via implode()
            $retval = 0; // ping succeeds -> hasInternetConnection() true
        });

        // fileGetContentsSSL() branches on extension_loaded('openssl'); force the
        // file_get_contents() branch deterministically regardless of host build.
        $extensionLoaded = $this->getFunctionMock('frieren\helper', 'extension_loaded');
        $extensionLoaded->expects($this->once())->with('openssl')->willReturn(true);

        $capturedUrl = null;
        $fileGetContents = $this->getFunctionMock('frieren\helper', 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturnCallback(function ($url) use (&$capturedUrl, $newsJson) {
            $capturedUrl = $url;
            return $newsJson;
        });

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getNews']);

        $this->assertNull($result['error']);
        $this->assertInstanceOf(\stdClass::class, $result['data']);
        $this->assertCount(1, $result['data']->news);
        $this->assertSame('2026-06-04', $result['data']->news[0]->date);
        $this->assertSame('Example news', $result['data']->news[0]->title);
        $this->assertSame('1.3.0', $result['data']->lastVersion->version);
        $this->assertSame('https://example.com/update.sh', $result['data']->lastVersion->updateUrl);
        $this->assertStringEndsWith('/json/news.json', $capturedUrl);
    }

    public function testGetNewsReturnsErrorWhenTheRemoteFetchFails(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $output = ['1 packets transmitted, 1 received']; // OpenWrtHelper::exec() merges this via implode()
            $retval = 0; // ping succeeds
        });

        $extensionLoaded = $this->getFunctionMock('frieren\helper', 'extension_loaded');
        $extensionLoaded->expects($this->once())->with('openssl')->willReturn(true);

        $fileGetContents = $this->getFunctionMock('frieren\helper', 'file_get_contents');
        $fileGetContents->expects($this->once())->willReturn(false); // remote fetch failed/timed out

        $result = $this->dispatch(DashboardController::class, 'dashboard', ['action' => 'getNews']);

        $this->assertSame('Error connecting to remote host. Please check your connection.', $result['error']);
        $this->assertNull($result['data']);
    }
}
