<?php
/*
 * Project: Frieren Framework
 * Tests for the `login` module (login/logout). `verifyPassword()` lives on
 * OpenWrtHelper (namespace frieren\helper) and reads /etc/shadow via a bare
 * `file_get_contents()` call, so it's intercepted here the same way the other
 * suites mock `exec()`: php-mock replaces the unqualified global function as
 * resolved from inside `frieren\helper`.
 */

namespace frieren\modules\login;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;
use frieren\core\Tests\Support\DispatchesControllers;

class LoginControllerTest extends TestCase
{
    use PHPMock;
    use DispatchesControllers;

    private const USERNAME = 'root';
    private const PASSWORD = 'CorrectHorse123!';

    protected function tearDown(): void
    {
        unset($_SESSION['user_logged'], $_SESSION['XSRF-TOKEN'], $_COOKIE['XSRF-TOKEN']);
        parent::tearDown();
    }

    /**
     * Builds a fake /etc/shadow file content with a real crypt() hash for
     * self::PASSWORD, so verifyPassword()'s own crypt()/hash_equals() logic
     * runs unmocked against real, correctly-formatted data.
     */
    private function fakeShadowFile(string $username, string $password): string
    {
        $hash = crypt($password, '$6$phpunitsalt$');

        return "{$username}:{$hash}:19000:0:99999:7:::\nother:!:19000:0:99999:7:::\n";
    }

    private function mockShadowFile(string $contents): void
    {
        $this->getFunctionMock('frieren\helper', 'file_get_contents')
            ->expects($this->once())
            ->with('/etc/shadow')
            ->willReturn($contents);
    }

    public function testLoginSucceedsWithValidCredentialsAndSetsSessionFlag(): void
    {
        $this->mockShadowFile($this->fakeShadowFile(self::USERNAME, self::PASSWORD));

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'login',
            'username' => self::USERNAME,
            'password' => self::PASSWORD,
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertTrue($_SESSION['user_logged']);
    }

    public function testLoginFailsWithIncorrectPasswordAndDoesNotAuthenticate(): void
    {
        $this->mockShadowFile($this->fakeShadowFile(self::USERNAME, self::PASSWORD));

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'login',
            'username' => self::USERNAME,
            'password' => 'wrong-password',
        ]);

        $this->assertSame('Not logged_in', $result['error']);
        $this->assertArrayNotHasKey('user_logged', $_SESSION);
    }

    public function testLoginFailsWithUnknownUsername(): void
    {
        $this->mockShadowFile($this->fakeShadowFile(self::USERNAME, self::PASSWORD));

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'login',
            'username' => 'nobody',
            'password' => self::PASSWORD,
        ]);

        $this->assertSame('Not logged_in', $result['error']);
        $this->assertArrayNotHasKey('user_logged', $_SESSION);
    }

    public function testLoginFailsWhenPasswordIsMissingWithoutTouchingShadowFile(): void
    {
        $this->getFunctionMock('frieren\helper', 'file_get_contents')->expects($this->never());

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'login',
            'username' => self::USERNAME,
        ]);

        $this->assertSame('Not logged_in', $result['error']);
        $this->assertArrayNotHasKey('user_logged', $_SESSION);
    }

    public function testLoginFailsWhenUsernameIsMissingWithoutTouchingShadowFile(): void
    {
        $this->getFunctionMock('frieren\helper', 'file_get_contents')->expects($this->never());

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'login',
            'password' => self::PASSWORD,
        ]);

        $this->assertSame('Not logged_in', $result['error']);
        $this->assertArrayNotHasKey('user_logged', $_SESSION);
    }

    public function testLogoutClearsSessionAndCsrfState(): void
    {
        // A real session is started (as ApiCore would have done before routing
        // to the controller) so logout()'s session_destroy() call has an active
        // session to tear down, instead of warning about an uninitialized one.
        session_start();
        $_SESSION['user_logged'] = true;
        $_SESSION['XSRF-TOKEN'] = 'some-token';
        $_COOKIE['XSRF-TOKEN'] = 'some-token';

        $result = $this->dispatch(LoginController::class, 'login', [
            'action' => 'logout',
        ]);

        $this->assertNull($result['error']);
        $this->assertSame(['success' => true], $result['data']);
        $this->assertArrayNotHasKey('user_logged', $_SESSION);
        $this->assertArrayNotHasKey('XSRF-TOKEN', $_SESSION);
        $this->assertArrayNotHasKey('XSRF-TOKEN', $_COOKIE);
    }
}
