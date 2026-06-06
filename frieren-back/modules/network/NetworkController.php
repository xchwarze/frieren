<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\network;

class NetworkController extends \frieren\core\Controller
{
    const HOST_REGEX = '/^[a-zA-Z0-9.:_-]+$/';
    const MAC_REGEX = '/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/';
    const NAME_REGEX = '/^[a-zA-Z0-9_-]+$/';
    const INTERFACE_NAME_REGEX = '/^[a-zA-Z0-9_]+$/';
    const PROTO_WHITELIST = ['static', 'dhcp'];
    const TOGGLE_ACTIONS = ['up', 'down'];

    public $endpointRoutes = [
        'runPing' => true,
        'runTraceroute' => true,
        'runNslookup' => true,
        'getArpTable' => true,
        'getDhcpLeases' => true,
        'getStaticLeases' => true,
        'addStaticLease' => true,
        'deleteStaticLease' => true,
        'getInterfaces' => true,
        'setInterface' => true,
        'toggleInterface' => true,
    ];

    /**
     * Validates the requested host against the strict charset whitelist.
     *
     * @return string|false The clean host, or false when invalid.
     */
    private function resolveHost()
    {
        $host = $this->request['host'] ?? '';
        if (!is_string($host) || !preg_match(self::HOST_REGEX, $host)) {
            return false;
        }

        return $host;
    }

    /**
     * @return bool True when the MAC address is well-formed.
     */
    private function isValidMac($mac)
    {
        return is_string($mac) && preg_match(self::MAC_REGEX, $mac) === 1;
    }

    /**
     * @return bool True when the interface name matches the strict whitelist.
     */
    private function isValidInterfaceName($name)
    {
        return is_string($name) && preg_match(self::INTERFACE_NAME_REGEX, $name) === 1;
    }

    /**
     * Validates a dotted IPv4 address without the `filter` PHP extension
     * (php-mod-filter is not guaranteed on OpenWrt). Also used for netmasks.
     *
     * @return bool
     */
    private function isValidIpv4($ip)
    {
        if (!is_string($ip) || !preg_match('/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/', $ip, $m)) {
            return false;
        }

        for ($i = 1; $i <= 4; $i++) {
            if ((int)$m[$i] > 255) {
                return false;
            }
        }

        return true;
    }

    public function runPing()
    {
        $host = $this->resolveHost();
        if ($host === false) {
            return self::setError('Invalid host');
        }

        return self::setSuccess([
            'output' => self::setupModuleHelper()::runPing($host),
        ]);
    }

    public function runTraceroute()
    {
        $host = $this->resolveHost();
        if ($host === false) {
            return self::setError('Invalid host');
        }

        return self::setSuccess([
            'output' => self::setupModuleHelper()::runTraceroute($host),
        ]);
    }

    public function runNslookup()
    {
        $host = $this->resolveHost();
        if ($host === false) {
            return self::setError('Invalid host');
        }

        return self::setSuccess([
            'output' => self::setupModuleHelper()::runNslookup($host),
        ]);
    }

    public function getArpTable()
    {
        return self::setSuccess([
            'neighbors' => self::setupModuleHelper()::getArpTable(),
        ]);
    }

    public function getDhcpLeases()
    {
        return self::setSuccess([
            'leases' => self::setupModuleHelper()::getDhcpLeases(),
        ]);
    }

    public function getStaticLeases()
    {
        return self::setSuccess([
            'leases' => self::setupModuleHelper()::getStaticLeases(),
        ]);
    }

    public function addStaticLease()
    {
        $name = $this->request['name'] ?? '';
        $mac = $this->request['mac'] ?? '';
        $ip = $this->request['ip'] ?? '';

        if (!is_string($name) || !preg_match(self::NAME_REGEX, $name)) {
            return self::setError('Invalid name');
        }
        if (!self::isValidMac($mac)) {
            return self::setError('Invalid MAC address');
        }
        if (!self::isValidIpv4($ip)) {
            return self::setError('Invalid IP address');
        }

        if (self::setupModuleHelper()::staticLeaseExists($mac)) {
            return self::setError('A static lease for this MAC already exists');
        }

        if (!self::setupModuleHelper()::addStaticLease($name, $mac, $ip)) {
            return self::setError('Failed to add static lease');
        }

        return self::setSuccess(['success' => true]);
    }

    public function deleteStaticLease()
    {
        $mac = $this->request['mac'] ?? '';
        if (!self::isValidMac($mac)) {
            return self::setError('Invalid MAC address');
        }

        if (!self::setupModuleHelper()::deleteStaticLease($mac)) {
            return self::setError('Failed to delete static lease');
        }

        return self::setSuccess(['success' => true]);
    }

    public function getInterfaces()
    {
        return self::setSuccess([
            'interfaces' => self::setupModuleHelper()::getInterfaces(),
        ]);
    }

    public function setInterface()
    {
        $name = $this->request['name'] ?? '';
        if (!self::isValidInterfaceName($name)) {
            return self::setError('Invalid interface');
        }

        $proto = $this->request['proto'] ?? '';
        if (!in_array($proto, self::PROTO_WHITELIST, true)) {
            return self::setError('Unsupported protocol');
        }

        if (!self::setupModuleHelper()::interfaceExists($name)) {
            return self::setError("Interface '{$name}' not found");
        }

        $ipaddr = $this->request['ipaddr'] ?? '';
        $netmask = $this->request['netmask'] ?? '';
        $gateway = $this->request['gateway'] ?? '';
        $dns = $this->request['dns'] ?? [];

        if ($proto === 'static') {
            if (!self::isValidIpv4($ipaddr)) {
                return self::setError('Invalid address: ipaddr');
            }
            if (!self::isValidIpv4($netmask)) {
                return self::setError('Invalid address: netmask');
            }
            if ($gateway !== '' && !self::isValidIpv4($gateway)) {
                return self::setError('Invalid address: gateway');
            }

            if (!is_array($dns)) {
                $dns = [];
            }
            foreach ($dns as $server) {
                if (!self::isValidIpv4($server)) {
                    return self::setError('Invalid address: dns');
                }
            }
        }

        if (!self::setupModuleHelper()::setInterface($name, $proto, $ipaddr, $netmask, $gateway, $dns)) {
            return self::setError('Failed to set interface');
        }

        return self::setSuccess(['success' => true]);
    }

    public function toggleInterface()
    {
        $name = $this->request['name'] ?? '';
        if (!self::isValidInterfaceName($name)) {
            return self::setError('Invalid interface');
        }

        // NOTE: param is `state` (not `action`) — `action` is the router's reserved
        // dispatch key and would always equal 'toggleInterface' here.
        $state = $this->request['state'] ?? '';
        if (!in_array($state, self::TOGGLE_ACTIONS, true)) {
            return self::setError('Unsupported action');
        }

        if (!self::setupModuleHelper()::toggleInterface($name, $state)) {
            return self::setError("Failed to bring interface {$state}");
        }

        return self::setSuccess(['success' => true]);
    }
}
