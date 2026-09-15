<?php
/*
 * Project: Frieren Framework
 * Tests for the built-in `terminal` module (ttyd web terminal on port 5001).
 * TerminalController has no ModuleOpenWrtHelper of its own — it reuses
 * settings\ModuleOpenWrtHelper for the terminal_* UCI flags and talks to
 * \frieren\helper\OpenWrtHelper directly for process control.
 *
 * Mocking surface, all via php-mock-phpunit:
 *   - `exec()` inside `frieren\helper` — the single choke point for every UCI
 *     read (SettingsHelper -> OpenWrtHelper::uciGet -> UciConfigHelper::uciGet),
 *     every `pgrep` (OpenWrtHelper::checkRunning) and every background/killall
 *     call (OpenWrtHelper::execBackground / OpenWrtHelper::exec), routed by
 *     inspecting the command string.
 *   - `file_get_contents()` inside `frieren\helper` — OpenWrtHelper::isSDAvailable()
 *     reads /proc/mounts; stubbed to report no SD card so getTerminalPath()
 *     deterministically resolves to the non-SD ttyd path.
 *   - `exec()` inside `frieren\modules\terminal` — TerminalController::startTerminal()
 *     calls the global `exec("/etc/init.d/ttyd stop")` directly (bypassing
 *     OpenWrtHelper), so it needs its own namespace-local mock.
 *   - `usleep()` inside `frieren\modules\terminal` — waitForRunning()'s poll
 *     delay; stubbed to a no-op so the launch tests don't actually sleep.
 */

namespace frieren\modules\terminal;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class TerminalControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    /**
     * Stubs every global function TerminalController's action methods can reach.
     *
     * @param array $uciMap Map of UCI key substring => raw `uci get` return value
     *     (e.g. 'terminal_enabled' => 'FALSE'). Keys absent from the map behave
     *     like a missing UCI entry (uci exits non-zero), which is how the real
     *     device behaves before a setting has ever been saved.
     * @param array $pgrepSequence Sequence of running/not-running answers for
     *     successive `pgrep` calls. Once only one element remains it is reused
     *     for every further call (sticky final state).
     * @param array $helperCommands Populated (by reference) with every command
     *     string passed to the mocked `frieren\helper` exec(), in call order.
     * @param array $moduleCommands Populated (by reference) with every command
     *     string passed to the mocked `frieren\modules\terminal` exec().
     * @param string|null $lanDevice Device the `lan` interface reports to the
     *     ubus `network.interface dump` that startTerminal() resolves its ttyd
     *     bind interface from. Null makes that dump come back empty, which is
     *     how a board with no `lan` section behaves.
     */
    private function stubTerminalEnvironment(
        array $uciMap,
        array $pgrepSequence,
        array &$helperCommands = [],
        array &$moduleCommands = [],
        ?string $lanDevice = null
    ): void {
        // No SD card in the test environment: forces getTerminalPath() down the
        // default (non-SD) branch without ever needing to mock file_exists().
        $this->getFunctionMock('frieren\helper', 'file_get_contents')
            ->expects($this->any())
            ->willReturn('rootfs / ext4 rw 0 0');

        $pgrepQueue = $pgrepSequence;
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->any())->willReturnCallback(
            function ($command, &$output = null, &$retval = null) use (&$helperCommands, $uciMap, &$pgrepQueue, $lanDevice) {
                $helperCommands[] = $command;

                if (strpos($command, 'network.interface') !== false) {
                    $output = $lanDevice === null ? [] : [json_encode([
                        'interface' => [
                            ['interface' => 'lan', 'proto' => 'static', 'up' => true, 'l3_device' => $lanDevice],
                        ],
                    ])];
                    $retval = 0;
                    return implode("\n", $output);
                }

                if (strpos($command, '/usr/bin/pgrep') === 0) {
                    $running = count($pgrepQueue) > 1 ? array_shift($pgrepQueue) : ($pgrepQueue[0] ?? false);
                    $output = $running ? ['1234'] : [];
                    $retval = 0;
                    return $running ? '1234' : '';
                }

                if (strpos($command, 'uci -q get') === 0) {
                    foreach ($uciMap as $needle => $value) {
                        if (strpos($command, $needle) !== false) {
                            $retval = 0;
                            return $value;
                        }
                    }
                    // Missing key: every terminal_* getter calls uciGet() with
                    // throwOnError=false, so this just falls back to its default.
                    $retval = 1;
                    return '';
                }

                // Any other exec() call (the nohup-wrapped ttyd launch, the
                // "disable ttyd" background call, killall, and the internal
                // `logger -p ...` shell-out) is reported as succeeding so it
                // can't trip Controller::logger()'s "$status === false" guard.
                // $output must be an array: OpenWrtHelper::exec() implode()s it
                // when $merge is true (the default, used by killall/logger).
                $output = [];
                $retval = 0;
                return '';
            }
        );

        $moduleExec = $this->getFunctionMock('frieren\modules\terminal', 'exec');
        $moduleExec->expects($this->any())->willReturnCallback(function ($command) use (&$moduleCommands) {
            $moduleCommands[] = $command;
        });

        $this->getFunctionMock('frieren\modules\terminal', 'usleep')->expects($this->any())->willReturn(null);
    }

    private function findCommandContaining(array $commands, string $needle): ?string
    {
        foreach ($commands as $command) {
            if (strpos($command, $needle) !== false) {
                return $command;
            }
        }

        return null;
    }

    // -- getStatus ------------------------------------------------------

    public function testGetStatusReturnsFalseWithoutCheckingTheProcessWhenTerminalIsDisabled(): void
    {
        $helperCommands = [];
        $this->stubTerminalEnvironment(['terminal_enabled' => 'FALSE'], [true], $helperCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'getStatus']);

        $this->assertNull($result['error']);
        $this->assertSame(['status' => false], $result['data']);
        $this->assertNull($this->findCommandContaining($helperCommands, 'pgrep'), 'Disabled terminal must not probe the process list');
    }

    public function testGetStatusReturnsTrueWhenTtydIsRunning(): void
    {
        $this->stubTerminalEnvironment([], [true]);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'getStatus']);

        $this->assertNull($result['error']);
        $this->assertSame(['status' => true], $result['data']);
    }

    public function testGetStatusReturnsFalseWhenTtydIsNotRunning(): void
    {
        $this->stubTerminalEnvironment([], [false]);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'getStatus']);

        $this->assertNull($result['error']);
        $this->assertSame(['status' => false], $result['data']);
    }

    // -- startTerminal ----------------------------------------------------

    public function testStartTerminalReturnsErrorWhenTerminalIsDisabled(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment(['terminal_enabled' => 'FALSE'], [false], $helperCommands, $moduleCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertSame('Terminal is disabled', $result['error']);
        $this->assertSame([], $moduleCommands, 'Must bail out before stopping/disabling the init.d service');
    }

    public function testStartTerminalSkipsLaunchingWhenTtydIsAlreadyRunning(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment([], [true], $helperCommands, $moduleCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'success' => true,
            'terminalTheme' => 'default',
            'fontSize' => 13,
            'cursorStyle' => 'block',
            'cursorBlink' => false,
        ], $result['data']);
        $this->assertContains('/etc/init.d/ttyd stop', $moduleCommands);
        $this->assertNull($this->findCommandContaining($helperCommands, '-p 5001'), 'Already-running ttyd must not be relaunched');
    }

    public function testStartTerminalLaunchesTtydOnPort5001WithLoginShellByDefault(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment([], [false, true], $helperCommands, $moduleCommands, 'br-guest');

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'success' => true,
            'terminalTheme' => 'default',
            'fontSize' => 13,
            'cursorStyle' => 'block',
            'cursorBlink' => false,
        ], $result['data']);

        $launchCommand = $this->findCommandContaining($helperCommands, '-p 5001');
        $this->assertNotNull($launchCommand, 'Expected a ttyd launch command');
        $this->assertStringStartsWith('/usr/bin/nohup ', $launchCommand);
        $this->assertStringContainsString('/usr/bin/ttyd -p 5001 -i br-guest /bin/login', $launchCommand);
    }

    /**
     * The bind interface used to be the literal `br-lan`, which silently fails
     * to bind on boards that don't bridge their LAN or name the bridge
     * differently. It is now resolved from the `lan` interface's real device
     * (same ubus dump the network module's getInterfaces() reads).
     */
    public function testStartTerminalBindsTtydToTheResolvedLanDeviceInsteadOfTheBrLanLiteral(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment([], [false, true], $helperCommands, $moduleCommands, 'eth0');

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $launchCommand = $this->findCommandContaining($helperCommands, '-p 5001');
        $this->assertNotNull($launchCommand);
        $this->assertStringContainsString('-i eth0 ', $launchCommand);
        $this->assertStringNotContainsString('br-lan', $launchCommand);
    }

    public function testStartTerminalFallsBackToBrLanWhenTheLanDeviceCannotBeResolved(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment([], [false, true], $helperCommands, $moduleCommands, null);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $launchCommand = $this->findCommandContaining($helperCommands, '-p 5001');
        $this->assertNotNull($launchCommand);
        $this->assertStringContainsString('-i br-lan ', $launchCommand);
    }

    public function testStartTerminalUsesAshShellWhenAutologinIsEnabled(): void
    {
        $helperCommands = [];
        $moduleCommands = [];
        $this->stubTerminalEnvironment(['terminal_autologin' => 'TRUE'], [false, true], $helperCommands, $moduleCommands, 'br-guest');

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $this->assertTrue($result['data']['success']);

        $launchCommand = $this->findCommandContaining($helperCommands, '-p 5001');
        $this->assertNotNull($launchCommand);
        $this->assertStringContainsString('/usr/bin/ttyd -p 5001 -i br-guest /bin/ash', $launchCommand);
        $this->assertStringNotContainsString('/bin/login', $launchCommand);
    }

    public function testStartTerminalReportsFailureWhenTtydNeverComesUp(): void
    {
        $helperCommands = [];
        // Sticky "false": checkRunning() reports not-running for the initial
        // check and for every one of the waitForRunning() poll attempts.
        $this->stubTerminalEnvironment([], [false], $helperCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'startTerminal']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => false], $result['data']);
        $this->assertNotNull($this->findCommandContaining($helperCommands, '-p 5001'), 'A launch attempt must still have been made');
    }

    // -- stopTerminal -------------------------------------------------------

    public function testStopTerminalReturnsErrorWhenTerminalIsDisabled(): void
    {
        $this->stubTerminalEnvironment(['terminal_enabled' => 'FALSE'], [true]);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'stopTerminal']);

        $this->assertSame('Terminal is disabled', $result['error']);
    }

    public function testStopTerminalReportsSuccessWhenTtydIsNoLongerRunning(): void
    {
        $helperCommands = [];
        $this->stubTerminalEnvironment([], [false], $helperCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'stopTerminal']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertNotNull($this->findCommandContaining($helperCommands, 'killall ttyd'));
    }

    public function testStopTerminalReportsFailureWhenTtydIsStillRunning(): void
    {
        $helperCommands = [];
        $this->stubTerminalEnvironment([], [true], $helperCommands);

        $result = $this->dispatch(TerminalController::class, 'terminal', ['action' => 'stopTerminal']);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => false], $result['data']);
        $this->assertNotNull($this->findCommandContaining($helperCommands, 'killall ttyd'));
    }
}
