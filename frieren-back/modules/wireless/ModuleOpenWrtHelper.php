<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\wireless;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const WIRELESS_CONFIG_PATH = '/etc/config/wireless';

    /**
     * Scans for networks on a given interface and returns a list of access points.
     *
     * @param string $interface The network interface to scan for networks.
     * @return array|null An array of access points with their details, or null if no networks are found.
     */
    public static function scanForNetworks($device)
    {
        $device = preg_replace('/[^a-zA-Z0-9_\-]/', '', $device);
        $scanData = OpenWrtHelper::execUbusCall('iwinfo', 'scan', ['device' => $device]);

        if ($scanData === false || !isset($scanData['results'])) {
            return [];
        }

        $apList = [];
        foreach ($scanData['results'] as $entry) {
            $ssid = $entry['ssid'] ?? '';
            if (empty($ssid) || !mb_check_encoding($ssid, 'UTF-8') || $ssid === 'unknown') {
                continue;
            }

            $enc = $entry['encryption'] ?? [];
            if (!($enc['enabled'] ?? false)) {
                $security = 'Open';
            } else {
                $wpa = $enc['wpa'] ?? [];
                $auth = $enc['authentication'] ?? [];
                $ciphers = $enc['ciphers'] ?? [];
                $parts = [];
                if (in_array(2, $wpa) && in_array('sae', $auth)) {
                    $parts[] = 'WPA3-SAE';
                } elseif (in_array(2, $wpa) && in_array('psk', $auth)) {
                    $parts[] = 'WPA2-PSK';
                } elseif (in_array(1, $wpa) && in_array('psk', $auth)) {
                    $parts[] = 'WPA-PSK';
                } elseif (!empty($wpa)) {
                    $parts[] = 'WPA' . implode('+', $wpa);
                }
                if (!empty($ciphers)) {
                    $parts[] = strtoupper(implode('+', $ciphers));
                }
                $security = implode(' / ', $parts) ?: 'Encrypted';
            }

            $apList[] = [
                'bssid'   => $entry['bssid'] ?? '',
                'ssid'    => $ssid,
                'channel' => $entry['channel'] ?? 0,
                'signal'  => $entry['signal'] ?? 0,
                'quality' => $entry['quality'] ?? 0,
                'security' => $security,
            ];
        }

        return $apList;
    }

    /**
     * Returns comprehensive radio+interface data using UCI as source of truth,
     * enriched with runtime state from ubus and iwinfo.
     *
     * @return array Array keyed by radio name, each containing radio info + array of interfaces.
     */
    public static function getWirelessOverview()
    {
        // UCI: source of truth for all radios and interfaces (including disabled)
        $uciData = OpenWrtHelper::execUbusCall('uci', 'get', ['config' => 'wireless']);
        $uciSections = ($uciData !== false && isset($uciData['values'])) ? $uciData['values'] : [];

        // network.wireless status: authoritative runtime ifnames and radio up state
        $wirelessStatus = OpenWrtHelper::execUbusCall('network.wireless', 'status');
        $wirelessStatus = ($wirelessStatus !== false) ? $wirelessStatus : [];

        // luci-rpc: hw metadata only (phy, hardware name, htmodes, hwmodes, country)
        $wirelessDevices = OpenWrtHelper::execUbusCall('luci-rpc', 'getWirelessDevices');
        $wirelessDevices = ($wirelessDevices !== false) ? $wirelessDevices : [];

        // Build runtime map: section -> {ifname, up} from network.wireless status
        $runtimeMap = [];
        foreach ($wirelessStatus as $radio => $details) {
            $radioUp = $details['up'] ?? false;
            foreach ($details['interfaces'] ?? [] as $iface) {
                $section = $iface['section'] ?? '';
                if ($section) {
                    $runtimeMap[$section] = [
                        'ifname' => $iface['ifname'] ?? null,
                        'up'     => $radioUp,
                    ];
                }
            }
        }

        // Separate radios (wifi-device) and interfaces (wifi-iface) from UCI
        $radios = [];
        $interfaces = [];
        foreach ($uciSections as $name => $config) {
            $type = $config['.type'] ?? '';
            if ($type === 'wifi-device') {
                $radios[$name] = $config;
            } elseif ($type === 'wifi-iface') {
                $interfaces[$name] = $config;
            }
        }

        $overview = [];
        foreach ($radios as $radioName => $radioConfig) {
            $ch = $radioConfig['channel'] ?? null;
            $chNum = is_numeric($ch) ? (int)$ch : 0;
            $band = (($chNum >= 36 && $chNum <= 64) || ($chNum >= 100 && $chNum <= 165)) ? '5 GHz' : '2.4 GHz';

            $luciRadio = $wirelessDevices[$radioName] ?? [];
            $iwinfo = $luciRadio['iwinfo'] ?? [];
            $statusRadio = $wirelessStatus[$radioName] ?? [];

            $radioInfo = [
                'channel'    => $ch,
                'txpower'    => null,
                'frequency'  => null,
                'band'       => $band,
                'htmode'     => $radioConfig['htmode'] ?? null,
                'up'         => $statusRadio['up'] ?? ($luciRadio['up'] ?? false),
                'disabled'   => ($radioConfig['disabled'] ?? '0') === '1',
                'phy'        => $iwinfo['phy'] ?? null,
                'country'    => $iwinfo['country'] ?? null,
                'hardware'   => $iwinfo['hardware']['name'] ?? null,
                'hwmodes'    => $iwinfo['hwmodes_text'] ?? null,
                'htmodes'    => $iwinfo['htmodes'] ?? [],
                'interfaces' => [],
            ];

            // Enrich with iwinfo runtime data (txpower, frequency) if radio is up
            if ($radioInfo['up'] && $iwinfo['phy'] ?? null) {
                $infoData = OpenWrtHelper::execUbusCall('iwinfo', 'info', ['device' => $iwinfo['phy']]);
                if ($infoData !== false) {
                    $radioInfo['txpower']   = $infoData['txpower'] ?? null;
                    $radioInfo['frequency'] = $infoData['frequency'] ?? null;
                }
            }

            // Attach interfaces from UCI that belong to this radio
            foreach ($interfaces as $section => $ifaceConfig) {
                if (($ifaceConfig['device'] ?? '') !== $radioName) {
                    continue;
                }

                $runtime = $runtimeMap[$section] ?? null;
                $ifname = $runtime['ifname'] ?? null;
                $ifaceUp = $ifname !== null && ($runtime['up'] ?? false);

                $radioInfo['interfaces'][] = [
                    'radio'      => $radioName,
                    'ifname'     => $ifname,
                    'section'    => $section,
                    'mode'       => $ifaceConfig['mode'] ?? '',
                    'ssid'       => $ifaceConfig['ssid'] ?? '',
                    'encryption' => $ifaceConfig['encryption'] ?? '',
                    'network'    => $ifaceConfig['network'] ?? '',
                    'hidden'     => ($ifaceConfig['hidden'] ?? '0') === '1',
                    'up'         => $ifaceUp,
                    'disabled'   => ($ifaceConfig['disabled'] ?? '0') === '1',
                ];
            }

            $overview[$radioName] = $radioInfo;
        }

        return $overview;
    }

    /**
     * Returns current radio config and available options for a given radio.
     *
     * @param string $radio The UCI radio name (e.g. 'radio0').
     * @return array Array with 'current' config and 'available' options.
     */
    public static function getRadioConfig($radio)
    {
        $radio = preg_replace('/[^a-zA-Z0-9_]/', '', $radio);

        $fields = ['channel', 'txpower', 'htmode', 'country', 'disabled'];
        $current = [];
        foreach ($fields as $field) {
            try {
                $current[$field] = OpenWrtHelper::uciGet("wireless.{$radio}.{$field}");
            } catch (\Exception $e) {
                $current[$field] = null;
            }
        }

        $channelData  = OpenWrtHelper::execUbusCall('iwinfo', 'freqlist', ['device' => $radio]);
        $txpowerData  = OpenWrtHelper::execUbusCall('iwinfo', 'txpowerlist', ['device' => $radio]);
        $countryData  = OpenWrtHelper::execUbusCall('iwinfo', 'countrylist', ['device' => $radio]);

        $channels = [];
        if ($channelData !== false && isset($channelData['results'])) {
            foreach ($channelData['results'] as $entry) {
                $channels[] = [
                    'channel'    => $entry['channel'] ?? null,
                    'mhz'        => $entry['mhz'] ?? null,
                    'restricted' => $entry['restricted'] ?? false,
                ];
            }
        }

        $txpowers = [];
        if ($txpowerData !== false && isset($txpowerData['results'])) {
            foreach ($txpowerData['results'] as $entry) {
                $txpowers[] = [
                    'dbm' => $entry['dbm'] ?? null,
                    'mw'  => $entry['mw'] ?? null,
                ];
            }
        }

        $countries = [];
        if ($countryData !== false && isset($countryData['results'])) {
            foreach ($countryData['results'] as $entry) {
                $countries[] = [
                    'code' => $entry['code'] ?? null,
                    'name' => $entry['name'] ?? null,
                ];
            }
        }

        // Get hardware-supported htmodes from luci-rpc
        $wirelessDevices = OpenWrtHelper::execUbusCall('luci-rpc', 'getWirelessDevices');
        $htmodes = ($wirelessDevices !== false && isset($wirelessDevices[$radio]['iwinfo']['htmodes']))
            ? $wirelessDevices[$radio]['iwinfo']['htmodes']
            : [];

        return [
            'current'   => $current,
            'available' => [
                'channels'  => $channels,
                'txpowers'  => $txpowers,
                'countries' => $countries,
                'htmodes'   => $htmodes,
            ],
        ];
    }

    /**
     * Writes radio configuration via UCI and reloads the radio.
     *
     * @param string $radio    UCI radio name (e.g. 'radio0').
     * @param mixed  $channel  Channel number or 'auto'.
     * @param mixed  $txpower  TX power in dBm.
     * @param string $htmode   HT mode string (e.g. 'VHT80').
     * @param string $country  Country code (e.g. 'US').
     * @param mixed  $disabled 0 or 1.
     * @return bool True on success.
     * @throws \Exception If the radio name is invalid.
     */
    public static function setRadioConfig($radio, $channel, $txpower, $htmode, $country, $disabled)
    {
        $radio = preg_replace('/[^a-zA-Z0-9_]/', '', $radio);

        // Validate radio exists in UCI
        $existing = OpenWrtHelper::uciGet("wireless.{$radio}");
        if ($existing === null || $existing === false) {
            throw new \Exception("Radio '{$radio}' not found in wireless config");
        }

        OpenWrtHelper::uciSet("wireless.{$radio}.channel", $channel, false, false);
        OpenWrtHelper::uciSet("wireless.{$radio}.txpower", $txpower, false, false);
        OpenWrtHelper::uciSet("wireless.{$radio}.htmode", $htmode, false, false);
        OpenWrtHelper::uciSet("wireless.{$radio}.country", $country, false, false);
        OpenWrtHelper::uciSet("wireless.{$radio}.disabled", $disabled ? 1 : 0, false, false);
        OpenWrtHelper::uciCommit();

        $safeRadio = escapeshellarg($radio);
        OpenWrtHelper::execBackground("wifi reload {$safeRadio} && wifi up {$safeRadio}");

        return true;
    }

    /**
     * Creates a new wireless interface under a given radio.
     *
     * @param string $radio      UCI radio name (e.g. 'radio0').
     * @param string $ssid       SSID for the new interface.
     * @param string $encryption Encryption type (e.g. 'psk2+ccmp', 'sae', 'none').
     * @param string $key        Pre-shared key (ignored when encryption is 'none').
     * @param string $mode       Interface mode (e.g. 'ap', 'sta', 'monitor').
     * @param string $network    UCI network name (e.g. 'lan', 'wwan', 'guest').
     * @return bool True on success.
     */
    public static function addInterface($radio, $ssid, $encryption, $key, $mode, $network, $hidden, $disabled, $isManagement = false, $isRecon = false)
    {
        $radio = preg_replace('/[^a-zA-Z0-9_]/', '', $radio);

        // Generate unique named section (wifinet0, wifinet1, ...)
        $uciData = OpenWrtHelper::execUbusCall('uci', 'get', ['config' => 'wireless']);
        $sections = ($uciData !== false && isset($uciData['values'])) ? $uciData['values'] : [];
        $maxN = -1;
        foreach (array_keys($sections) as $name) {
            if (preg_match('/^wifinet(\d+)$/', $name, $m)) {
                $maxN = max($maxN, (int)$m[1]);
            }
        }
        $sectionName = 'wifinet' . ($maxN + 1);

        OpenWrtHelper::exec('uci set ' . escapeshellarg("wireless.{$sectionName}=wifi-iface"));
        OpenWrtHelper::uciSet("wireless.{$sectionName}.device", $radio, false, false);
        OpenWrtHelper::uciSet("wireless.{$sectionName}.mode", $mode, false, false);

        if ($mode !== 'monitor') {
            OpenWrtHelper::uciSet("wireless.{$sectionName}.disabled", $disabled ? 1 : 0, false, false);
            OpenWrtHelper::uciSet("wireless.{$sectionName}.network", $network, false, false);
            OpenWrtHelper::uciSet("wireless.{$sectionName}.ssid", $ssid, false, false);
            OpenWrtHelper::uciSet("wireless.{$sectionName}.encryption", $encryption, false, false);
            OpenWrtHelper::uciSet("wireless.{$sectionName}.hidden", $hidden ? 1 : 0, false, false);
            if ($encryption !== 'none') {
                OpenWrtHelper::uciSet("wireless.{$sectionName}.key", $key, false, false);
            }
        }

        OpenWrtHelper::uciCommit();

        if ($mode === 'ap' && $isManagement) {
            OpenWrtHelper::uciSet('frieren.@settings[0].management_interface', $sectionName);
        }
        if ($mode === 'monitor' && $isRecon) {
            OpenWrtHelper::uciSet('frieren.@settings[0].recon_interface', $sectionName);
        }

        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }

    /**
     * Deletes a wireless interface by its UCI section name.
     *
     * @param string $section UCI section name (e.g. 'default_radio0').
     * @return bool True on success.
     * @throws \Exception If the section does not exist.
     */
    public static function removeInterface($section)
    {
        $section = preg_replace('/[^a-zA-Z0-9_@\[\]\-]/', '', $section);

        $existing = OpenWrtHelper::uciGet("wireless.{$section}");
        if ($existing === null || $existing === false) {
            throw new \Exception("Interface section '{$section}' not found in wireless config");
        }

        OpenWrtHelper::exec('uci delete ' . escapeshellarg("wireless.{$section}"));
        OpenWrtHelper::uciCommit();

        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }

    /**
     * Enables or disables a specific wireless interface.
     *
     * @param string $section  UCI section name.
     * @param int    $disabled 1 to disable, 0 to enable.
     * @return bool True on success.
     * @throws \Exception If the section does not exist.
     */
    public static function toggleInterface($section, $disabled)
    {
        $section = preg_replace('/[^a-zA-Z0-9_@\[\]\-]/', '', $section);

        $existing = OpenWrtHelper::uciGet("wireless.{$section}");
        if ($existing === null || $existing === false) {
            throw new \Exception("Interface section '{$section}' not found in wireless config");
        }

        OpenWrtHelper::uciSet("wireless.{$section}.disabled", $disabled ? 1 : 0, false, false);
        OpenWrtHelper::uciCommit();

        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }

    /**
     * Returns the current UCI config for a specific wireless interface section.
     *
     * @param string $section UCI section name.
     * @return array Array with device, network, mode, ssid, encryption, key, disabled, hidden, bssid.
     */
    public static function getInterfaceConfig($section)
    {
        $section = preg_replace('/[^a-zA-Z0-9_@\[\]\-]/', '', $section);

        $fields = ['device', 'network', 'mode', 'ssid', 'encryption', 'key', 'disabled', 'hidden', 'bssid'];
        $config = [];
        foreach ($fields as $field) {
            try {
                $config[$field] = OpenWrtHelper::uciGet("wireless.{$section}.{$field}");
            } catch (\Exception $e) {
                $config[$field] = '';
            }
        }

        return $config;
    }

    /**
     * Updates the UCI config for an existing wireless interface section.
     *
     * @param string $section    UCI section name.
     * @param string $ssid       SSID.
     * @param string $encryption Encryption type.
     * @param string $key        Pre-shared key.
     * @param string $mode       Interface mode.
     * @param string $network    UCI network name.
     * @param mixed  $hidden     Whether to hide the SSID (1 or 0).
     * @param mixed  $disabled   Whether to disable the interface (1 or 0).
     * @return bool True on success.
     * @throws \Exception If the section does not exist.
     */
    public static function setInterfaceConfig($section, $ssid, $encryption, $key, $mode, $network, $hidden, $disabled)
    {
        $section = preg_replace('/[^a-zA-Z0-9_@\[\]\-]/', '', $section);

        $existing = OpenWrtHelper::uciGet("wireless.{$section}");
        if ($existing === null || $existing === false) {
            throw new \Exception("Interface section '{$section}' not found in wireless config");
        }

        OpenWrtHelper::uciSet("wireless.{$section}.mode", $mode, false, false);
        OpenWrtHelper::uciSet("wireless.{$section}.disabled", $disabled ? 1 : 0, false, false);

        if ($mode === 'monitor') {
            OpenWrtHelper::uciSet("wireless.{$section}.network", '', false, false);
        } else {
            OpenWrtHelper::uciSet("wireless.{$section}.ssid", $ssid, false, false);
            OpenWrtHelper::uciSet("wireless.{$section}.encryption", $encryption, false, false);
            OpenWrtHelper::uciSet("wireless.{$section}.key", $key, false, false);
            OpenWrtHelper::uciSet("wireless.{$section}.network", $network, false, false);
            OpenWrtHelper::uciSet("wireless.{$section}.hidden", $hidden ? 1 : 0, false, false);
        }

        OpenWrtHelper::uciCommit();

        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }

    /**
     * Returns the list of associated clients for a wireless interface.
     *
     * @param string $interface The wireless interface name (e.g. 'wlan0').
     * @return array Array of client entries with mac, signal, noise, rx_rate, tx_rate, inactive.
     */
    public static function getAssociationList($interface)
    {
        $safeInterface = preg_replace('/[^a-zA-Z0-9_\-]/', '', $interface);

        // Try ubus first
        $ubusData = OpenWrtHelper::execUbusCall('iwinfo', 'assoclist', ['device' => $safeInterface]);
        if ($ubusData !== false && isset($ubusData['results']) && !empty($ubusData['results'])) {
            $clients = [];
            foreach ($ubusData['results'] as $entry) {
                $clients[] = [
                    'mac'      => $entry['mac'] ?? '',
                    'signal'   => $entry['signal'] ?? null,
                    'noise'    => $entry['noise'] ?? null,
                    'rx_rate'  => $entry['rx']['rate'] ?? null,
                    'tx_rate'  => $entry['tx']['rate'] ?? null,
                    'inactive' => $entry['inactive'] ?? null,
                ];
            }
            return $clients;
        }

        // Fallback: parse CLI output of iwinfo <iface> assoclist
        $escapedInterface = escapeshellarg($safeInterface);
        $cliOutput = OpenWrtHelper::exec("iwinfo {$escapedInterface} assoclist");
        if (empty($cliOutput) || strpos($cliOutput, 'No station connected') !== false) {
            return [];
        }

        $clients = [];
        // Each client block starts with a MAC address line
        // Example lines:
        //   XX:XX:XX:XX:XX:XX  -65 dBm / -95 dBm (SNR 30)  0 ms ago
        //   RX: 54.0 MBit/s, MCS 5, 20MHz                         5 Pkts.
        //   TX: 65.0 MBit/s, MCS 7, 20MHz                         8 Pkts.
        $blocks = preg_split('/(?=^[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/m', $cliOutput);
        foreach ($blocks as $block) {
            $block = trim($block);
            if (empty($block)) {
                continue;
            }

            $entry = [
                'mac'      => '',
                'signal'   => null,
                'noise'    => null,
                'rx_rate'  => null,
                'tx_rate'  => null,
                'inactive' => null,
            ];

            // MAC + signal/noise line
            if (preg_match('/^([0-9A-Fa-f:]{17})\s+(-?\d+)\s+dBm\s*\/\s*(-?\d+)\s+dBm.*?(\d+)\s+ms\s+ago/i', $block, $m)) {
                $entry['mac']      = strtoupper($m[1]);
                $entry['signal']   = intval($m[2]);
                $entry['noise']    = intval($m[3]);
                $entry['inactive'] = intval($m[4]);
            } elseif (preg_match('/^([0-9A-Fa-f:]{17})/i', $block, $m)) {
                $entry['mac'] = strtoupper($m[1]);
            }

            if (empty($entry['mac'])) {
                continue;
            }

            // RX rate
            if (preg_match('/RX:\s*([\d.]+)\s*MBit\/s/i', $block, $m)) {
                $entry['rx_rate'] = floatval($m[1]);
            }

            // TX rate
            if (preg_match('/TX:\s*([\d.]+)\s*MBit\/s/i', $block, $m)) {
                $entry['tx_rate'] = floatval($m[1]);
            }

            $clients[] = $entry;
        }

        return $clients;
    }

    /**
     * Returns the raw content of /etc/config/wireless.
     *
     * @return string Raw UCI config file content.
     */
    public static function getRawWirelessConfig()
    {
        return file_get_contents(self::WIRELESS_CONFIG_PATH) ?: '';
    }

    /**
     * Writes raw content to /etc/config/wireless and reloads wifi.
     *
     * @param string $content Raw UCI config content.
     * @return bool True on success.
     * @throws \Exception If write fails.
     */
    public static function setRawWirelessConfig($content)
    {
        if (file_put_contents(self::WIRELESS_CONFIG_PATH, $content) === false) {
            throw new \Exception('Failed to write wireless config');
        }

        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }

    /**
     * Regenerates /etc/config/wireless from hardware defaults using wifi config,
     * then reloads wifi.
     *
     * @return bool True on success.
     */
    public static function resetWirelessConfig()
    {
        OpenWrtHelper::exec('wifi config > ' . self::WIRELESS_CONFIG_PATH);
        OpenWrtHelper::execBackground('wifi reload');

        return true;
    }
}
