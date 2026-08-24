<?php
/*
 * Project: Frieren Framework
 * Shared test helper for Controller tests. `Controller::__construct()`
 * auto-dispatches the action and stores the result in a private
 * ResponseHandler with no public getter for its data/error/statusCode
 * (dispatchResponse() calls exit(), so it can't be invoked in a test process).
 * This trait uses Reflection to read those private properties directly.
 *
 * Usage:
 *   use frieren\core\Tests\Support\DispatchesControllers;
 *   ...
 *   $result = $this->dispatch(DashboardController::class, 'dashboard', [
 *       'action' => 'getSystemStats',
 *   ]);
 *   $this->assertNull($result['error']);
 *   $this->assertArrayHasKey('cpu_cores', $result['data']);
 */

namespace frieren\core\Tests\Support;

trait DispatchesControllers
{
    /**
     * @param class-string $controllerClass Fully-qualified Controller subclass.
     * @param string $moduleName The module name passed to the constructor (must
     *     match the class's own namespace stem, e.g. 'dashboard' for
     *     frieren\modules\dashboard\DashboardController).
     * @param array $request The full request array, including 'action'.
     * @return array{data: mixed, error: mixed, statusCode: ?int}
     */
    protected function dispatch(string $controllerClass, string $moduleName, array $request): array
    {
        $controller = new $controllerClass($request, $moduleName);
        $responseHandler = $controller->getResponseHandler();

        $reflection = new \ReflectionClass($responseHandler);

        $read = function (string $property) use ($reflection, $responseHandler) {
            $prop = $reflection->getProperty($property);
            $prop->setAccessible(true);
            return $prop->getValue($responseHandler);
        };

        return [
            'data' => $read('data'),
            'error' => $read('error'),
            'statusCode' => $read('statusCode'),
        ];
    }
}
