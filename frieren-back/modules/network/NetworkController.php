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
    const INTERFACE_NAME_REGEX = '/^[a-zA-Z0-9_-]+$/';
    const MTU_MIN = 576;
    const MTU_MAX = 9216;
    // Only protocols that need no UCI option beyond what setInterface() already
    // writes. pppoe/6in4 and friends require extra fields (credentials, tunnel
    // endpoints) the form does not collect, so they stay out.
    const PROTO_WHITELIST = ['static', 'dhcp', 'dhcpv6'];
    const TOGGLE_ACTIONS = ['up', 'down', 'restart'];

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
        'getAvailableDevices' => true,
        'addInterface' => true,
        'removeInterface' => true,
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
     * @return bool True when $mtu is '' (leave at kernel default) or a plausible MTU value.
     */
    private function isValidMtu($mtu)
    {
        if ($mtu === '') {
            return true;
        }

        return is_numeric($mtu) && $mtu >= self::MTU_MIN && $mtu <= self::MTU_MAX;
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

    public function getAvailableDevices()
    {
        return self::setSuccess([
            'devices' => self::setupModuleHelper()::getAvailableDevices(),
        ]);
    }

    public function addInterface()
    {
        $name = $this->request['name'] ?? '';
        if (!self::isValidInterfaceName($name)) {
            return self::setError('Invalid interface');
        }

        $device = $this->request['device'] ?? '';
        if ($device === '') {
            return self::setError('Device is mandatory');
        }

        $proto = $this->request['proto'] ?? '';
        if (!in_array($proto, self::PROTO_WHITELIST, true)) {
            return self::setError('Unsupported protocol');
        }

        $ipaddr = $this->request['ipaddr'] ?? '';
        $netmask = $this->request['netmask'] ?? '';
        $gateway = $this->request['gateway'] ?? '';
        $dns = $this->request['dns'] ?? [];
        $mtu = $this->request['mtu'] ?? '';
        $macaddr = $this->request['macaddr'] ?? '';
        $peerdns = $this->request['peerdns'] ?? true;

        if (!self::isValidMtu($mtu)) {
            return self::setError('Invalid MTU');
        }

        $addressError = self::validateStaticFields($proto, $ipaddr, $netmask, $gateway, $dns);
        if ($addressError !== null) {
            return self::setError($addressError);
        }

        if (!self::setupModuleHelper()::addInterface($name, $device, $proto, $ipaddr, $netmask, $gateway, $dns, $mtu, $macaddr, $peerdns)) {
            return self::setError('Failed to add interface');
        }

        return self::setSuccess(['success' => true]);
    }

    public function removeInterface()
    {
        $name = $this->request['name'] ?? '';
        if (!self::isValidInterfaceName($name)) {
            return self::setError('Invalid interface');
        }

        if (!self::setupModuleHelper()::removeInterface($name)) {
            return self::setError('Failed to remove interface');
        }

        return self::setSuccess(['success' => true]);
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
        $mtu = $this->request['mtu'] ?? '';
        $macaddr = $this->request['macaddr'] ?? '';
        $peerdns = $this->request['peerdns'] ?? true;

        if (!self::isValidMtu($mtu)) {
            return self::setError('Invalid MTU');
        }

        $addressError = self::validateStaticFields($proto, $ipaddr, $netmask, $gateway, $dns);
        if ($addressError !== null) {
            return self::setError($addressError);
        }

        if (!self::setupModuleHelper()::setInterface($name, $proto, $ipaddr, $netmask, $gateway, $dns, $mtu, $macaddr, $peerdns)) {
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
            return self::setError($state === 'restart' ? 'Failed to restart interface' : "Failed to bring interface {$state}");
        }

        return self::setSuccess(['success' => true]);
    }

    /**
     * Validates static-proto address fields (ipaddr/netmask/gateway/dns), mutating $dns
     * into an array when it isn't one already. Non-static protocols need no validation
     * here since setInterface()/addInterface() ignore these fields for them.
     *
     * @param string $proto
     * @param string $ipaddr
     * @param string $netmask
     * @param string $gateway
     * @param mixed $dns Passed by reference; coerced to an array for the static case.
     * @return string|null An error message, or null when the fields are valid.
     */
    private function validateStaticFields($proto, $ipaddr, $netmask, $gateway, &$dns)
    {
        if ($proto !== 'static') {
            return null;
        }

        if (!self::isValidIpv4($ipaddr)) {
            return 'Invalid address: ipaddr';
        }
        if (!self::isValidIpv4($netmask)) {
            return 'Invalid address: netmask';
        }
        if ($gateway !== '' && !self::isValidIpv4($gateway)) {
            return 'Invalid address: gateway';
        }

        if (!is_array($dns)) {
            $dns = [];
        }
        foreach ($dns as $server) {
            if (!self::isValidIpv4($server)) {
                return 'Invalid address: dns';
            }
        }

        return null;
    }
}
