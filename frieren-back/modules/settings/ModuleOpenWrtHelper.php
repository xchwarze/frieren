<?php

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
        OpenWrtHelper::exec("echo {$hostname} > /proc/sys/kernel/hostname");

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
        if (crypt($current, $salt) == $currentShadowPass) {
            $newHashedPassword = crypt($new, $salt);
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
        return [
            'hostname' => getHostname(),
            'timezone' => self::getSystemTimeZone(),
            'theme' => OpenWrtHelper::uciGet('frieren.@settings[0].theme'),
        ];
    }
}
