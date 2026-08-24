<?php
/*
 * Project: Frieren Framework
 * Tests for the `settings` module (hostname/timezone/datetime/password/theme).
 * SettingsController::* delegate straight to ModuleOpenWrtHelper, which talks to
 * `OpenWrtHelper`/`UciConfigHelper` (namespace `frieren\helper`) via unqualified
 * `exec()` calls, and to `/etc/shadow` via unqualified `file_get_contents()` /
 * `file_put_contents()` resolved in this module's own namespace
 * (`frieren\modules\settings`). Both are mocked with php-mock-phpunit so these
 * run on any host, never touching a real UCI config or /etc/shadow.
 */

namespace frieren\modules\settings;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class SettingsControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    public function testGetSectionDataReturnsHostnameTimezoneAndUiSettingsFromUci(): void
    {
        $this->getFunctionMock('frieren\helper', 'file_exists')->expects($this->once())->willReturn(true);
        $this->getFunctionMock('frieren\helper', 'file')->expects($this->once())->willReturn([
            "config settings",
            "\toption theme 'dark'",
            "\toption terminal_autologin 'TRUE'",
            "\toption terminal_theme 'nord'",
            "\toption terminal_font_size '14'",
            "\toption terminal_cursor_style 'bar'",
            "\toption terminal_cursor_blink 'TRUE'",
            "\toption terminal_enabled 'TRUE'",
        ]);
        $this->getFunctionMock('frieren\modules\settings', 'gethostname')->expects($this->once())->willReturn('frieren');

        // getSystemTimeZone() reads the raw (sign-reversed) OpenWrt value; 'GMT+3'
        // on disk must come back to the browser as 'GMT-3'.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            return 'GMT+3';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', ['action' => 'getSectionData']);

        $this->assertNull($result['error']);
        $this->assertSame([
            'hostname' => 'frieren',
            'timezone' => 'GMT-3',
            'theme' => 'dark',
            'terminalAutologin' => true,
            'terminalTheme' => 'nord',
            'fontSize' => 14,
            'cursorStyle' => 'bar',
            'cursorBlink' => true,
            'terminalEnabled' => true,
        ], $result['data']);
    }

    public function testSetHostnameSucceedsWhenUciWriteAndReadbackMatch(): void
    {
        $newHostname = 'new-router';

        // setSystemHostname() makes 4 calls in this namespace: uciSet (set+commit),
        // the raw `echo > /proc/sys/kernel/hostname`, then the readback uciGet.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(4))->willReturnCallback(function ($command, &$output = null, &$retval = null) use ($newHostname) {
            $output = [];
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return $newHostname;
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setHostname',
            'hostname' => $newHostname,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    /**
     * Finding: setSystemHostname() has no charset/format whitelist. The value is
     * only ever passed through escapeshellarg() (which prevents shell injection
     * but does not reject the value itself), so a string with spaces and shell
     * metacharacters is accepted and round-tripped into UCI + the kernel hostname
     * write untouched. This test documents the current (unsafe-by-omission)
     * behavior rather than a desired one.
     */
    public function testSetHostnameAcceptsInvalidCharactersBecauseNoFormatValidationExists(): void
    {
        $maliciousHostname = "evil host; rm -rf /";
        $capturedCommands = [];

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(4))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$capturedCommands, $maliciousHostname) {
            $capturedCommands[] = $command;
            $output = [];
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return $maliciousHostname;
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setHostname',
            'hostname' => $maliciousHostname,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);

        $hostnameEchoCommand = null;
        foreach ($capturedCommands as $command) {
            if (strpos($command, '/proc/sys/kernel/hostname') !== false) {
                $hostnameEchoCommand = $command;
            }
        }

        $this->assertNotNull($hostnameEchoCommand);
        $this->assertStringContainsString(escapeshellarg($maliciousHostname), $hostnameEchoCommand);
    }

    public function testSetTimezoneConvertsGmtSignAndWritesWhenChanged(): void
    {
        $callCount = 0;

        // First uciGet (compare) reports the old value so the write path runs:
        // uciSet (set+commit) + `/etc/init.d/system reload` + final readback = 5 calls.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(5))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$callCount) {
            $callCount++;
            $output = [];
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return $callCount === 1 ? 'GMT+5' : 'GMT+3';
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setTimezone',
            'timezone' => 'GMT-3',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    /**
     * Finding: changeSystemTimeZone() has no whitelist against a known IANA/GMT
     * offset list either — any string that doesn't contain 'GMT' is written as-is.
     */
    public function testSetTimezoneAcceptsAnyStringWithoutValidatingAgainstAKnownList(): void
    {
        $bogusTimezone = 'NotARealZone';
        $callCount = 0;

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(5))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$callCount, $bogusTimezone) {
            $callCount++;
            $output = [];
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return $callCount === 1 ? 'GMT+3' : $bogusTimezone;
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setTimezone',
            'timezone' => $bogusTimezone,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    public function testSetDatetimeFromBrowserSyncsTheClockWhenTimezoneIsAlreadyCurrent(): void
    {
        $captured = [];

        // The timezone compare short-circuits true (already set) so only 2 exec
        // calls happen total: the compare, then `date -s @<epoch>`.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(2))->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured[] = $command;
            $output = [];
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return 'GMT+3';
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setDatetimeFromBrowser',
            'datetime' => 1700000000,
            'timezone' => 'GMT-3',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertStringContainsString('date -s @1700000000', $captured[1]);
    }

    public function testSetDatetimeFromBrowserSkipsTheClockSyncForABogusPreEpochValueButStillSucceedsViaTimezone(): void
    {
        // syncDatetimeFromBrowser() rejects anything before MIN_SYNC_EPOCH before
        // ever calling exec(); only the timezone compare call should happen.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            return 'GMT+3';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setDatetimeFromBrowser',
            'datetime' => 100,
            'timezone' => 'GMT-3',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    public function testSetUserPasswordSucceedsWhenCurrentPasswordMatchesTheShadowEntry(): void
    {
        $currentPassword = 'oldpass123';
        $newPassword = 'newpass456';
        $salt = '$1$abcd1234$';
        $currentHash = crypt($currentPassword, $salt);
        $shadowContents = "root:{$currentHash}:19000:0:99999:7:::\ndaemon:*:19000:0:99999:7:::\n";

        $this->getFunctionMock('frieren\modules\settings', 'file_get_contents')
            ->expects($this->once())
            ->willReturn($shadowContents);

        $capturedWrite = null;
        $this->getFunctionMock('frieren\modules\settings', 'file_put_contents')
            ->expects($this->once())
            ->willReturnCallback(function ($path, $contents) use (&$capturedWrite) {
                $capturedWrite = $contents;
                return strlen($contents);
            });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setUserPassword',
            'currentPassword' => $currentPassword,
            'newPassword' => $newPassword,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);

        $rewrittenLines = explode("\n", $capturedWrite);
        $newHash = explode(':', $rewrittenLines[0])[1];

        $this->assertSame($newHash, crypt($newPassword, $newHash), 'The freshly written hash must verify against the new password');
        $this->assertStringContainsString('daemon:*:19000:0:99999:7:::', $capturedWrite, 'Other shadow entries must be left untouched');
    }

    public function testSetUserPasswordFailsWhenCurrentPasswordIsWrongAndDoesNotTouchTheShadowFile(): void
    {
        $salt = '$1$abcd1234$';
        $correctHash = crypt('therealpassword', $salt);
        $shadowContents = "root:{$correctHash}:19000:0:99999:7:::\n";

        $this->getFunctionMock('frieren\modules\settings', 'file_get_contents')
            ->expects($this->once())
            ->willReturn($shadowContents);

        $this->getFunctionMock('frieren\modules\settings', 'file_put_contents')
            ->expects($this->never());

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setUserPassword',
            'currentPassword' => 'totallyWrongPassword',
            'newPassword' => 'newpass456',
        ]);

        $this->assertSame('Error setting password.', $result['error']);
        $this->assertNull($result['data']);
    }

    public function testSetPanelThemeSucceedsForAKnownThemeValue(): void
    {
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return 'dark';
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setPanelTheme',
            'theme' => 'dark',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }

    /**
     * Finding: setPanelTheme() has no whitelist against the panel's known theme
     * set ('auto'|'dark'|'light') — any string is written as-is.
     */
    public function testSetPanelThemeAcceptsAnyStringWithoutValidatingAgainstTheKnownThemeList(): void
    {
        $bogusTheme = 'neon-green-nonsense';

        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->exactly(3))->willReturnCallback(function ($command, &$output = null, &$retval = null) use ($bogusTheme) {
            $retval = 0;
            if (strpos($command, 'uci -q get') !== false) {
                return $bogusTheme;
            }

            return '';
        });

        $result = $this->dispatch(SettingsController::class, 'settings', [
            'action' => 'setPanelTheme',
            'theme' => $bogusTheme,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
    }
}
