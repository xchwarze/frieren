<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

class DeviceConfig
{
    // This flag tells the framework which helpers to use depending on which host variant is running the project
    const GUESS_TYPE = 'OpenWrt';


    // Module behaviour
    const MODULE_ROOT_FOLDER = '/pineapple/modules-dev';
    const MODULE_SD_ROOT_FOLDER = '/sd/modules';
    const MODULE_WEB_ROOT_FOLDER = '/modules-dev';
    const MODULE_USE_INTERNAL_STORAGE = true;
    const MODULE_USE_USB_STORAGE = true;
    const MODULE_HIDE_SYSTEM_MODULES = true;


    // Remote content
    const SERVER_URL = 'https://raw.githubusercontent.com/xchwarze/wifi-pineapple-community/main';
    const UPGRADE_PATH = '%s/json/upgrades.json';
    const MODULES_PATH = '%s/json/modules.json';
    const INSTALL_MODULE_PATH = '%s/modules/build/%s';
}
