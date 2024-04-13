<?php

namespace frieren\modules\wireless;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    /**
     * Get current network information for a specific interface.
     *
     * @param string $interface The interface for which to retrieve network information.
     * @return array|null An array containing the network information or null if no information is available.
     */
    public static function getCurrentNetworkInfo($interface)
    {
        $interface = escapeshellarg($interface);
        $networkInfo = OpenWrtHelper::exec("iwinfo {$interface} info", false);
        if (empty($networkInfo)) {
            return null;
        }

        $networkInfoData = [];
        foreach ($networkInfo as $line) {
            if (preg_match('/ESSID:\s*"([^"]+)"/', $line, $matches)) {
                $networkInfoData['ssid'] = $matches[1];
            } else if (preg_match("/^\s*Access Point:\s*([A-F0-9:]{17})/", $line, $matches)) {
                $networkInfoData['bssid'] = $matches[1];
            } else if (preg_match("/^\s*Mode:\s*(\S+)/", $line, $matches)) {
                $networkInfoData['mode'] = strtolower($matches[1]);
            } else if (preg_match("/^\s*Channel:\s*(\d+)/", $line, $matches)) {
                $networkInfoData['channel'] = intval($matches[1]);
            } else if (preg_match("/^\s*Signal:\s*(-?\d+)/", $line, $matches)) {
                $networkInfoData['signal'] = $matches[1] . ' dBm';
            } else if (preg_match("/^\s*Link Quality:\s*([\d\/]+)/", $line, $matches)) {
                $networkInfoData['quality'] = $matches[1];
            } else if (preg_match("/^\s*Encryption:\s*(.*)/", $line, $matches)) {
                $networkInfoData['security'] = $matches[1];
            } else if (preg_match("/^\s*Bit Rate:\s*(.*)/", $line, $matches)) {
                $networkInfoData['bit_rate'] = $matches[1];
            }
        }

        return $networkInfoData;
    }

    /**
     * Retrieves the list of wireless interfaces available in the system.
     *
     * @return array The list of wireless interfaces available in the system, or false if the command execution fails.
     * @throws \Exception If there is an error executing the 'ls -1 /sys/class/net/' command.
     */
    public static function getSystemWirelessInterfaces()
    {
        $output = OpenWrtHelper::exec('ls -1 /sys/class/net/', false);
        if (!$output) {
            throw new \Exception('Error executing ls -1 /sys/class/net/');
        }

        $interfaces = [];
        foreach ($output as $interface) {
            if (preg_match('/(wlan|phy)/', $interface)) {
                $interfaces[] = $interface;
            }
        }

        return array_reverse($interfaces);
    }

    /**
     * Determines the band and interface type for wireless interfaces.
     *
     * @return array An array with details about each wireless interface.
     */
    public static function getUbusWirelessStatus() {
        $data = OpenWrtHelper::execUbusCall('network.wireless status');

        $results = [];
        foreach ($data as $radio => $details) {
            if (!$details['up']) {
                continue;
            }

            foreach ($details['interfaces'] as $iface) {
                $band = '2.4 GHz';
                $channel = $details['config']['channel'];
                if (($channel >= 36 && $channel <= 64) || ($channel >= 100 && $channel <= 165)) {
                //if ($details['config']['hwmode'] === '11a' || strpos($details['config']['htmode'], 'VHT') !== false) {
                    $band = '5 GHz';
                }

                $interfaceType = 'Internal';
                if (strpos($details['config']['path'], 'usb') !== false) {
                    $interfaceType = 'USB';
                }

                $results[] = [
                    'radio' => $radio,
                    'ifname' => $iface['ifname'] ?? $iface['config']['ifname'], // from OpenWrt 19.07.7
                    'section' => $iface['section'],
                    'band' => $band,
                    'interface_type' => $interfaceType,
                    'mode' => $iface['config']['mode'] ?? '',
                    'ssid' => $iface['config']['ssid'] ?? '',
                ];
            }
        }

        return $results;
    }

    /**
     * Finds the wireless interface details by interface name.
     *
     * @param string $interface The interface name to find.
     * @return array|false The interface details as an array, or false if not found.
     */
    public static function findWirelessInterfaceDetails($interface) {
        $filteredDetails = array_filter(self::getUbusWirelessStatus(), function($detail) use ($interface) {
            return $detail['ifname'] === $interface;
        });
        $interfaceDetail = reset($filteredDetails);

        return $interfaceDetail ?? false;
    }


    /**
     * Retrieves the wireless interfaces and returns an array of values and labels.
     *
     * @return array An array of wireless interfaces with values and labels.
     */
    public static function getWirelessInterfaces()
    {
        return array_map(function ($interface) {
            return [
                'value' => $interface['ifname'],
                'label' => "{$interface['ifname']} ({$interface['interface_type']}, {$interface['band']})"
            ];
        }, self::getUbusWirelessStatus());
    }

    /**
     * Retrieves the wireless management network configuration.
     *
     * @return array The management configuration array containing the following keys:
     * - interface: The interface for the management configuration.
     * - ssid: The SSID for the management configuration.
     * - hidden: Whether the management configuration is hidden or not.
     * - disabled: Whether the management configuration is disabled or not.
     * @throws \Exception If there is an error reading the UCI config file.
     */
    public static function getManagementConfig()
    {
        $config = OpenWrtHelper::uciReadConfig('frieren');

        return [
            'interface' => $config['@settings[0]']['management_interface'] ?? '',
            'ssid' => $config['@management[0]']['ssid'] ?? '',
            'hidden' => $config['@management[0]']['hidden'] ?? '',
            'disabled' => $config['@management[0]']['disabled'] ?? '',
        ];
    }

    /**
     * Sets the wireless management configuration for a given interface.
     *
     * @param string $interface The interface name.
     * @param string $ssid The SSID (network name) to set.
     * @param string $psk The pre-shared key (password) to set.
     * @param bool $hidden Whether the network should be hidden or not.
     * @param bool $disabled Whether the network should be disabled or not.
     * @return bool Returns true if the SSID was successfully set, false otherwise.
     * @throws \Exception If there Interface to sections translation problem
     */
    public static function setManagementConfig($interface, $ssid, $psk, $hidden, $disabled)
    {
        // check if already in use
        $config = OpenWrtHelper::uciReadConfig('frieren');
        if ($config['@settings[0]']['client_interface'] === $interface) {
            throw new \Exception('The interface is in use to be able to connect to the internet');
        }

        // save frieren settings
        OpenWrtHelper::uciSet('frieren.@settings[0].management_interface', $interface, false, false);
        OpenWrtHelper::uciSet('frieren.@management[0].ssid', $ssid, false, false);
        OpenWrtHelper::uciSet('frieren.@management[0].psk', $psk, false, false);
        OpenWrtHelper::uciSet('frieren.@management[0].hidden', $hidden, false, false);
        OpenWrtHelper::uciSet('frieren.@management[0].disabled', $disabled, false, false);
        OpenWrtHelper::uciCommit();

        $interfaceDetail = self::findWirelessInterfaceDetails($interface);
        if (!$interfaceDetail) {
            throw new \Exception('Interface to sections translation problem');
        }

        // create AP
        $uciInterface = $interfaceDetail['section'];
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.network", 'lan', false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.mode", 'ap', false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.encryption", 'psk2+ccmp', false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.ssid", $ssid, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.key", $psk, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.hidden", $hidden ? 1 : 0, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.disabled", $disabled ? 1 : 0, false, false);
        OpenWrtHelper::uciCommit();

        OpenWrtHelper::execBackground('wifi');

        return true;
    }

    /**
     * Retrieves the client configuration from the OpenWrtHelper class.
     *
     * @return array The client configuration data
     */
    public static function getClientConfig()
    {
        $config = OpenWrtHelper::uciReadConfig('frieren');
        $iwinfo = self::getCurrentNetworkInfo($config['@settings[0]']['client_interface']);
        $status = OpenWrtHelper::execUbusCall('network.interface.wwan status');

        return [
            //'connected' => $iwinfo['mode'] === 'client' && $iwinfo['security'] !== 'unknown',
            'connected' => $status['up'],
            'interface' => $config['@settings[0]']['client_interface'],
            'ssid' => $iwinfo['ssid'] ?? '',
        ];

        /*
        return [
            'interface"' => $data['device'],
            'connected' => $data['up'],
            'ip_address' => !empty($data['ipv4-address']) ? $data['ipv4-address'][0]['address'] : null,
            'dns_servers' => !empty($data['dns-server'] ? implode(', ', $data['dns-server']) : null),
            'uptime' => $data['uptime'] ?? null,
            'hostname' => $data['data']['hostname'] ?? null,
        ];
        */
    }

    /**
     * Scans for networks on a given interface and returns a list of access points.
     *
     * @param string $interface The network interface to scan for networks.
     * @return array|null An array of access points with their details, or null if no networks are found.
     */
    public static function scanForNetworks($interface)
    {
        // TODO: if disabled....
        /*
        uci set wireless.@wifi-device[0].disabled="0"
        uci commit wireless
        wifi
        */

        // TODO: if interface is in monitor mode....

        $interface = escapeshellarg($interface);
        $apScan = OpenWrtHelper::exec("iwinfo {$interface} scan");
        if (empty($apScan) || strpos($apScan, 'No scan results') !== false) {
            return [];
        }

        $apBlocks = preg_split("/^Cell/m", $apScan);

        $apList = [];
        foreach ($apBlocks as $block) {
            preg_match("~Address:\s*([A-F0-9:]{17})\s+ESSID:\s*\"([^\"]*)\".*?Channel:\s*(\d+).*?Signal:\s*(-?\d+)\s+dBm.*?Quality:\s*([\d/]+).*?Encryption:\s*([^\n]*)~ms", $block, $match);
            if (!$match) {
                continue;
            }

            [$fullMatch, $bssid, $ssid, $channel, $signal, $quality, $security] = $match;
            if (empty($ssid) || !mb_check_encoding($ssid, 'UTF-8') || $ssid === 'unknown') {
                continue;
            }

            $apList[] = [
                'bssid' => $bssid,
                'ssid' => $ssid,
                'channel' => intval($channel),
                'signal' => $signal,
                'quality' => $quality,
                'security' => ($security === 'none') ? 'Open' : $security,
            ];
        }

        return $apList;
    }

    /**
     * Maps the AP security to the corresponding encryption type.
     *
     * @param string $security The security type of the AP
     * @return string|false The corresponding encryption type or false if not found
     */
    private static function mapApSecurityToEncryption($security) {
        // simplifies the security type by removing the 'PSK' suffix
        $security = str_replace(' PSK', '', $security);

        $securityMappings = [
            'Open' => 'none',
            'WPA (TKIP)' => 'psk+tkip',
            'WPA (CCMP)' => 'psk+ccmp',
            'WPA (TKIP, CCMP)' => 'psk+tkip+ccmp',
            'WPA2 (TKIP)' => 'psk2+tkip',
            'WPA2 (CCMP)' => 'psk2+ccmp',
            'WPA2 (TKIP, CCMP)' => 'psk2+ccmp+tkip',
            'WPA3 (SAE)' => 'sae',
            'WPA3 (CCMP)' => 'sae+ccmp',
            'mixed WPA/WPA2 (TKIP)' => 'psk-mixed+tkip',
            'mixed WPA/WPA2 (CCMP)' => 'psk-mixed+ccmp',
            'mixed WPA/WPA2 (TKIP, CCMP)' => 'psk-mixed+ccmp+tkip',
            'mixed WPA2/WPA3 (SAE)' => 'psk2+sae',
            'mixed WPA2/WPA3 (CCMP)' => 'psk2+sae+ccmp',
        ];

        return $securityMappings[$security] ?? false;
    }

    /**
     * Connects to the specified AP with the provided parameters.
     *
     * @param mixed $interface The interface to connect to
     * @param string $ssid The SSID of the AP
     * @param string $security The security type of the AP
     * @param string $psk The pre-shared key for authentication
     * @throws \Exception The interface is already in use, security type not supported, or translation problem
     * @return bool Returns true if the connection is successful
     */
    public static function connectToAP($interface, $ssid, $security, $psk) {
        // check if already in use
        $config = OpenWrtHelper::uciReadConfig('frieren');
        if ($config['@settings[0]']['management_interface'] === $interface) {
            throw new \Exception('The interface is in use by the management network');
        }

        // I try to clear all problematic states before connecting to the AP
        OpenWrtHelper::execUbusCall('network.interface.wwan up');
        exec('[ ! -z "$(wifi config)" ] && wifi config >> /etc/config/wireless');

        $encryption = self::mapApSecurityToEncryption($security);
        if (!$encryption) {
            throw new \Exception('Security type not supported');
        }

        $interfaceDetail = self::findWirelessInterfaceDetails($interface);
        if (!$interfaceDetail) {
            throw new \Exception('Interface to sections translation problem');
        }

        // save frieren settings
        OpenWrtHelper::uciSet('frieren.@settings[0].client_interface', $interface);

        // connect to AP
        $uciInterface = $interfaceDetail['section'];
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.network", 'wwan', false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.mode", 'sta', false, false);
        //OpenWrtHelper::uciSet("wireless.{$uciInterface}.bssid", $bssid, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.ssid", $ssid, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.encryption", $encryption, false, false);
        OpenWrtHelper::uciSet("wireless.{$uciInterface}.key", $psk, false, false);
        OpenWrtHelper::uciCommit();

        //if ($interfaceDetail['radio'] === false) {
        //    OpenWrtHelper::execBackground('wifi');
        OpenWrtHelper::exec("wifi reload {$interfaceDetail['radio']} && wifi up {$interfaceDetail['radio']}");

        return true;
    }

    /**
     * Disable the WWAN interface.
     */
    public static function disableWwanInterface()
    {
        OpenWrtHelper::execUbusCall('network.interface.wwan down');
    }
}
