<?php
/*
 * Project: Frieren Framework
 * Tests for BackgroundTaskHelper. The status-check methods are pure
 * filesystem checks against real /tmp files (no mocking needed); start()'s
 * single exec() call is mocked so no shell command actually runs.
 */

namespace frieren\helper;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;

class BackgroundTaskHelperTest extends TestCase
{
    use PHPMock;

    private string $taskName;

    protected function setUp(): void
    {
        parent::setUp();
        $this->taskName = 'phpunit-' . uniqid();
    }

    protected function tearDown(): void
    {
        BackgroundTaskHelper::cleanup($this->taskName);
        parent::tearDown();
    }

    public function testStatusIsIdleWhenNeitherFileExists(): void
    {
        $this->assertFalse(BackgroundTaskHelper::isCompleted($this->taskName));
        $this->assertFalse(BackgroundTaskHelper::isRunning($this->taskName));
        $this->assertSame(['completed' => false, 'output' => ''], BackgroundTaskHelper::getStatus($this->taskName));
    }

    public function testIsRunningOnceTheLogExistsButNotTheFlag(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath($this->taskName), "starting\n");

        $this->assertTrue(BackgroundTaskHelper::isRunning($this->taskName));
        $this->assertFalse(BackgroundTaskHelper::isCompleted($this->taskName));
    }

    public function testIsCompletedAndNoLongerRunningOnceTheFlagExists(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath($this->taskName), "done\n");
        touch(BackgroundTaskHelper::getFlagPath($this->taskName));

        $this->assertTrue(BackgroundTaskHelper::isCompleted($this->taskName));
        $this->assertFalse(
            BackgroundTaskHelper::isRunning($this->taskName),
            'A task with its flag set must no longer be reported as running'
        );

        $status = BackgroundTaskHelper::getStatus($this->taskName);
        $this->assertTrue($status['completed']);
        $this->assertSame("done\n", $status['output']);
    }

    public function testCleanupRemovesBothFilesAndResetsStatus(): void
    {
        touch(BackgroundTaskHelper::getLogPath($this->taskName));
        touch(BackgroundTaskHelper::getFlagPath($this->taskName));

        BackgroundTaskHelper::cleanup($this->taskName);

        $this->assertFalse(file_exists(BackgroundTaskHelper::getLogPath($this->taskName)));
        $this->assertFalse(file_exists(BackgroundTaskHelper::getFlagPath($this->taskName)));
        $this->assertFalse(BackgroundTaskHelper::isRunning($this->taskName));
        $this->assertFalse(BackgroundTaskHelper::isCompleted($this->taskName));
    }

    public function testStartWrapsTheCommandSoTheFlagIsTouchedRegardlessOfExitCode(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command) use (&$captured) {
            $captured = $command;
        });

        BackgroundTaskHelper::start($this->taskName, 'false'); // 'false' always exits 1

        $flagPath = BackgroundTaskHelper::getFlagPath($this->taskName);
        $this->assertStringContainsString("false; touch {$flagPath}", $captured);
        $this->assertStringStartsWith('/usr/bin/nohup sh -c', $captured);
    }

    public function testStartUnlinksAnyPriorFlagAndLogBeforeLaunching(): void
    {
        file_put_contents(BackgroundTaskHelper::getLogPath($this->taskName), 'stale output');
        touch(BackgroundTaskHelper::getFlagPath($this->taskName));

        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(static function () {});

        BackgroundTaskHelper::start($this->taskName, 'true');

        $this->assertFalse(
            file_exists(BackgroundTaskHelper::getFlagPath($this->taskName)),
            'start() must clear a stale flag from a previous run before relaunching'
        );
    }
}
