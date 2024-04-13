<?php

namespace frieren\modules\wireless;

class WirelessController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getWirelessInterfaces',
        'getManagementConfig',
        'setManagementConfig',
        'scanForNetworks',
        'getClientConfig',
        'setClientConfig',
        'disableWwanInterface'
    ];

    public function getWirelessInterfaces()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getWirelessInterfaces()
        );
    }

    public function getManagementConfig()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getManagementConfig()
        );
    }

    public function setManagementConfig()
    {
        if (self::setupModuleHelper()::setManagementConfig(
            $this->request['interface'],
            $this->request['ssid'],
            $this->request['psk'],
            $this->request['hidden'],
            $this->request['disabled']
        )) {
            return self::setSuccess();
        }

        self::setError('Error changing Wireless config.');
    }

    public function scanForNetworks()
    {
        return self::setSuccess(
            self::setupModuleHelper()::scanForNetworks($this->request['interface'])
        );
    }

    public function getClientConfig()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getClientConfig()
        );
    }

    public function setClientConfig()
    {
        self::setupModuleHelper()::connectToAP(
            $this->request['interface'],
            $this->request['ssid'],
            $this->request['security'],
            $this->request['psk']
        );
        return self::setSuccess();
    }

    public function disableWwanInterface()
    {
        self::setupModuleHelper()::disableWwanInterface();
        return self::setSuccess();
    }
}
