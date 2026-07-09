<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\settings;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    /**
     * Converts the OpenWrt IANA timezone value to a standard representation.
     *
     * @param string $timezone The timezone value to be converted.
     * @return string The converted timezone value.
     */
    public static function convertOpenWrtTimezoneValue($timezone)
    {
        // Because of the way IANA handles time zones I have to reverse the sign!
        if (strpos($timezone, 'GMT') !== false) {
            $newSign = strpos($timezone, '-') !== false ? '+' : '-';
            $timezone = str_replace(['+', '-'], $newSign, $timezone);
        }

        return $timezone;
    }

    /**
     * Retrieves the system's time zone from the OpenWrt configuration.
     *
     * @return string The system's time zone.
     */
    public static function getSystemTimeZone()
    {
        $timezone = OpenWrtHelper::uciGet('system.@system[0].timezone');

        return self::convertOpenWrtTimezoneValue($timezone);
    }

    /**
     * Change the system timezone to the specified timezone.
     *
     * @param string $timezone The new timezone to set.
     * @return bool Whether the timezone was successfully changed.
     */
    public static function changeSystemTimeZone($timezone)
    {
        $timezone = self::convertOpenWrtTimezoneValue($timezone);
        OpenWrtHelper::uciSet('system.@system[0].timezone', $timezone);
        OpenWrtHelper::exec('/etc/init.d/system reload');

        return OpenWrtHelper::uciGet('system.@system[0].timezone') === $timezone;
    }

    /**
     * Syncs the datetime from the browser to the system.
     *
     * @param string $datetime The datetime value to sync.
     * @return bool Returns true if datetime synced successfully, false otherwise.
     */
    public static function syncDatetimeFromBrowser($datetime)
    {
        $epoch = intval($datetime);
        if (date('Y', $epoch) >= date('Y')) {
            OpenWrtHelper::exec("date -s @{$epoch}");
            return true;
        }

        return false;
    }

    /**
     * Set the system hostname in OpenWrt configuration and update the system hostname.
     *
     * @param string $hostname The new hostname to set
     * @return bool Whether the hostname was successfully set
     */
    public static function setSystemHostname($hostname)
    {
        OpenWrtHelper::uciSet('system.@system[0].hostname', $hostname);
        $command = "echo " . escapeshellarg($hostname) . " > /proc/sys/kernel/hostname";
        OpenWrtHelper::exec($command, true, true);

        return OpenWrtHelper::uciGet('system.@system[0].hostname') === $hostname;
    }

    /**
     * Changes the password in the /etc/shadow file if the current password matches the one in the file.
     *
     * @param mixed $current The current password.
     * @param mixed $new The new password to set.
     * @return bool Returns true if the password was successfully changed, false otherwise.
     * @throws \Exception If there is an error loading the /etc/shadow file or if the format is incorrect.
     */
    public static function changeUserPassword($current, $new)
    {
        $shadowFileContent = file_get_contents('/etc/shadow');
        if ($shadowFileContent === false) {
            throw new \Exception('Error loading /etc/shadow file');
        }

        $lines = explode("\n", $shadowFileContent);
        $rootEntry = explode(':', $lines[0]);
        $currentHashParts = explode('$', $rootEntry[1]);
        if (count($currentHashParts) < 4) {
            throw new \Exception('Format error in /etc/shadow file');
        }

        $salt = '$' . $currentHashParts[1] . '$' . $currentHashParts[2] . '$';
        $currentShadowPass = $salt . $currentHashParts[3];
        if (hash_equals($currentShadowPass, crypt($current, $salt))) {
            $newSalt = '$' . $currentHashParts[1] . '$' . bin2hex(random_bytes(8)) . '$';
            $newHashedPassword = crypt($new, $newSalt);
            $rootEntry[1] = $newHashedPassword;
            $lines[0] = implode(':', $rootEntry);

            if (file_put_contents('/etc/shadow', implode("\n", $lines))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sets the panel theme.
     *
     * @param string $theme The theme to set.
     * @return bool Returns true if the theme was successfully set, false otherwise.
     */
    public static function setPanelTheme($theme)
    {
        OpenWrtHelper::uciSet('frieren.@settings[0].theme', $theme);

        return OpenWrtHelper::uciGet('frieren.@settings[0].theme') === $theme;
    }


    /**
     * Retrieves the terminal autologin setting.
     *
     * @return bool Whether terminal autologin is enabled.
     */
    public static function getTerminalAutologin()
    {
        return OpenWrtHelper::uciGet('frieren.@settings[0].terminal_autologin', false) === true;
    }

    /**
     * Retrieves the terminal theme setting.
     *
     * @return string The terminal theme identifier.
     */
    public static function getTerminalTheme()
    {
        return OpenWrtHelper::uciGet('frieren.@settings[0].terminal_theme', false) ?? 'default';
    }

    /**
     * Persists all terminal settings in a single batch: writes every field with
     * autoCommit disabled and commits once (one flash write instead of one per
     * field), skipping the per-field read-back (uciSet throws on failure).
     *
     * @param string $theme       Terminal theme identifier.
     * @param int    $fontSize    Font size (clamped to 8..32).
     * @param string $cursorStyle Cursor style (block|underline|bar).
     * @param bool   $cursorBlink Whether the cursor blinks.
     * @param bool   $autologin   Whether terminal autologin is enabled.
     * @return bool False when cursorStyle is invalid; true once saved.
     */
    public static function saveTerminalSettings($theme, $fontSize, $cursorStyle, $cursorBlink, $autologin)
    {
        if (!in_array($cursorStyle, ['block', 'underline', 'bar'], true)) {
            return false;
        }

        $fontSize = (string) max(8, min(32, (int) $fontSize));

        OpenWrtHelper::uciSet('frieren.@settings[0].terminal_theme', $theme, false, false);
        OpenWrtHelper::uciSet('frieren.@settings[0].terminal_font_size', $fontSize, false, false);
        OpenWrtHelper::uciSet('frieren.@settings[0].terminal_cursor_style', $cursorStyle, false, false);
        OpenWrtHelper::uciSet('frieren.@settings[0].terminal_cursor_blink', (bool) $cursorBlink, false, false);
        OpenWrtHelper::uciSet('frieren.@settings[0].terminal_autologin', (bool) $autologin, false, false);
        OpenWrtHelper::uciCommit();

        return true;
    }

    /**
     * Retrieves the terminal font size.
     *
     * @return int The font size value.
     */
    public static function getTerminalFontSize()
    {
        return (int) (OpenWrtHelper::uciGet('frieren.@settings[0].terminal_font_size', false) ?? 13);
    }

    /**
     * Retrieves the terminal cursor style.
     *
     * @return string The cursor style (block, underline, bar).
     */
    public static function getTerminalCursorStyle()
    {
        return OpenWrtHelper::uciGet('frieren.@settings[0].terminal_cursor_style', false) ?? 'block';
    }

    /**
     * Retrieves the terminal cursor blink setting.
     *
     * @return bool Whether cursor blink is enabled.
     */
    public static function getTerminalCursorBlink()
    {
        return OpenWrtHelper::uciGet('frieren.@settings[0].terminal_cursor_blink', false) === true;
    }

    /**
     * Retrieves the section data for the current settings.
     *
     * This function returns an array containing the following data:
     * - hostname: The hostname obtained from the `getHostname()` function.
     * - timezone: The system timezone obtained from the `getSystemTimeZone()` method.
     * - theme: The theme obtained from the `OpenWrtHelper::uciGet()` method with the parameter `'uci get frieren.@settings[0].theme'`.
     *
     * @return array The section data for the current settings.
     */
    public static function getSectionData()
    {
        // Read the frieren config once (0 forks) instead of one `uci get` per
        // field. Anonymous @settings[0] is keyed correctly by the file parser.
        try {
            $settings = OpenWrtHelper::uciReadConfig('frieren')['@settings[0]'] ?? [];
        } catch (\Exception $e) {
            $settings = [];
        }

        return [
            'hostname' => gethostname(),
            'timezone' => self::getSystemTimeZone(),
            'theme' => $settings['theme'] ?? 'auto',
            'terminalAutologin' => ($settings['terminal_autologin'] ?? null) === true,
            'terminalTheme' => $settings['terminal_theme'] ?? 'default',
            'fontSize' => (int) ($settings['terminal_font_size'] ?? 13),
            'cursorStyle' => $settings['terminal_cursor_style'] ?? 'block',
            'cursorBlink' => ($settings['terminal_cursor_blink'] ?? null) === true,
        ];
    }
}
