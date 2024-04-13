<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\login;

class LoginController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'login',
        'logout'
    ];

    public function login()
    {
        if (isset($this->request['username']) && isset($this->request['password'])) {
            if (self::setupCoreHelper()::verifyPassword($this->request['username'], $this->request['password'])) {
                $_SESSION['user_logged'] = true;
                session_write_close();

                return self::setSuccess();
            }
        }

        self::setError('Not logged_in');
    }

    public function logout()
    {
        unset($_SESSION['XSRF-TOKEN']);
        unset($_SESSION['user_logged']);
        unset($_COOKIE['XSRF-TOKEN']);
        setcookie('XSRF-TOKEN', '', time() - 3600, '/');
        session_destroy();

        self::setSuccess();
    }
}