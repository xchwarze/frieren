<?php
/*
 * Project: Frieren Framework — module template
 * Same helper as frieren-back/tests/Support/DispatchesControllers.php,
 * duplicated here on purpose: this composer.json is an independent,
 * test-only manifest (see its description) and doesn't share test code
 * across repos, matching frieren-back/frieren-modules-private's convention
 * of each module owning a complete, self-contained test setup.
 *
 * Controller::__construct() auto-dispatches the action into a private
 * ResponseHandler with no public getter (dispatchResponse() calls exit()),
 * so this reads the result back via Reflection.
 */

namespace frieren\modules\demo\Tests\Support;

trait DispatchesControllers
{
    /**
     * @param class-string $controllerClass
     * @param string $moduleName
     * @param array $request
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
