<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\wireless;

class WirelessController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'scanForNetworks' => true,
        'getWirelessOverview' => true,
        'getRadioConfig' => true,
        'setRadioConfig' => true,
        'getAssociationList' => true,
        'addInterface' => true,
        'removeInterface' => true,
        'toggleInterface' => true,
        'getInterfaceConfig' => true,
        'setInterfaceConfig' => true,
        'getRawWirelessConfig' => true,
        'setRawWirelessConfig' => true,
        'resetWirelessConfig' => true,
    ];

    public function scanForNetworks()
    {
        return self::setSuccess(
            self::setupModuleHelper()::scanForNetworks($this->request['device'])
        );
    }

    public function getWirelessOverview()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getWirelessOverview()
        );
    }

    public function getRadioConfig()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getRadioConfig($this->request['radio'])
        );
    }

    public function setRadioConfig()
    {
        if (self::setupModuleHelper()::setRadioConfig(
            $this->request['radio'],
            $this->request['channel'],
            $this->request['txpower'],
            $this->request['htmode'],
            $this->request['country'],
            $this->request['disabled']
        )) {
            return self::setSuccess();
        }

        self::setError('Error changing radio config.');
    }

    public function getAssociationList()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getAssociationList($this->request['interface'])
        );
    }

    public function addInterface()
    {
        if (self::setupModuleHelper()::addInterface(
            $this->request['radio'],
            $this->request['ssid'],
            $this->request['encryption'],
            $this->request['key'],
            $this->request['mode'],
            $this->request['network'],
            $this->request['hidden'],
            $this->request['disabled'],
            $this->request['isManagement'] ?? false,
            $this->request['isRecon'] ?? false
        )) {
            return self::setSuccess();
        }

        self::setError('Error adding interface.');
    }

    public function removeInterface()
    {
        if (self::setupModuleHelper()::removeInterface(
            $this->request['section']
        )) {
            return self::setSuccess();
        }

        self::setError('Error removing interface.');
    }

    public function toggleInterface()
    {
        if (self::setupModuleHelper()::toggleInterface(
            $this->request['section'],
            $this->request['disabled']
        )) {
            return self::setSuccess();
        }

        self::setError('Error toggling interface.');
    }

    public function getInterfaceConfig()
    {
        return self::setSuccess(
            self::setupModuleHelper()::getInterfaceConfig($this->request['section'])
        );
    }

    public function setInterfaceConfig()
    {
        if (self::setupModuleHelper()::setInterfaceConfig(
            $this->request['section'],
            $this->request['ssid'],
            $this->request['encryption'],
            $this->request['key'],
            $this->request['mode'],
            $this->request['network'],
            $this->request['hidden'],
            $this->request['disabled']
        )) {
            return self::setSuccess();
        }

        self::setError('Error updating interface config.');
    }

    public function getRawWirelessConfig()
    {
        return self::setSuccess([
            'content' => self::setupModuleHelper()::getRawWirelessConfig(),
        ]);
    }

    public function setRawWirelessConfig()
    {
        if (self::setupModuleHelper()::setRawWirelessConfig($this->request['content'])) {
            return self::setSuccess();
        }

        self::setError('Error writing wireless config.');
    }

    public function resetWirelessConfig()
    {
        if (self::setupModuleHelper()::resetWirelessConfig()) {
            return self::setSuccess();
        }

        self::setError('Error resetting wireless config.');
    }
}
