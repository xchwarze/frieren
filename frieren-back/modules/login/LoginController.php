<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\login;

class LoginController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'login' => true,
        'logout' => true,
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

        return self::setError('Not logged_in');
    }

    public function logout()
    {
        unset($_SESSION['XSRF-TOKEN']);
        unset($_SESSION['user_logged']);
        unset($_COOKIE['XSRF-TOKEN']);
        $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        setcookie('XSRF-TOKEN', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
        session_destroy();

        return self::setSuccess();
    }
}