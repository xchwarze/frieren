<?php
/*
 * Project: Frieren Framework
 * Tests for Router::routeModule()/loadModule(). The module name gate
 * (routeModule()'s `/^[a-z0-9_]+$/i` regex) already rules out '.'/'/' and
 * therefore any '../' traversal, so the realpath() prefix check in
 * loadModule() (TODO-1.5.md M1) is a second, independent layer that's never
 * reachable through the public API with a real payload. These tests exercise
 * it directly via Reflection, mocking realpath() (mocked in this class's own
 * namespace, `frieren\core`, which is where Router.php lives) to simulate the
 * scenarios the regex alone can't produce.
 */

namespace frieren\core;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;

class RouterTest extends TestCase
{
    use PHPMock;

    public function testRouteModuleRejectsAnEmptyOrInvalidModuleName(): void
    {
        $router = new Router(['module' => 'evil/../traversal']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No valid module has been specified.');

        $router->routeModule();
    }

    public function testLoadModuleThrowsWhenTheModulesRootItselfDoesNotResolve(): void
    {
        // On a dev/CI host, DeviceConfig::MODULE_ROOT_FOLDER ('/frieren/modules') doesn't
        // exist, so both realpath() calls return false — the exact case that had to keep
        // producing the same "does not exist" exception this test pins.
        $this->getFunctionMock('frieren\core', 'realpath')->expects($this->atLeastOnce())->willReturn(false);

        $router = new Router(['module' => 'demo']);
        $reflection = new \ReflectionMethod(Router::class, 'loadModule');
        $reflection->setAccessible(true);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Module file for 'demo' does not exist.");

        $reflection->invoke($router, 'demo');
    }

    public function testLoadModuleRejectsAResolvedPathOutsideTheModulesRoot(): void
    {
        // A naive `strpos($moduleRealPath, $baseDir) !== 0` (no trailing separator) would
        // wrongly accept a sibling directory like '/frieren/modules-evil/...' just because
        // it starts with the literal string '/frieren/modules'. Simulate exactly that to
        // prove the trailing-DIRECTORY_SEPARATOR fix actually rejects it.
        $realpath = $this->getFunctionMock('frieren\core', 'realpath');
        $realpath->expects($this->exactly(2))->willReturnOnConsecutiveCalls(
            '/frieren/modules-evil/DemoController.php',
            '/frieren/modules'
        );

        $router = new Router(['module' => 'demo']);
        $reflection = new \ReflectionMethod(Router::class, 'loadModule');
        $reflection->setAccessible(true);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Module file for 'demo' does not exist.");

        $reflection->invoke($router, 'demo');
    }

}
