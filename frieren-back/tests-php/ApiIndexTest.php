<?php

namespace frieren;

use PHPUnit\Framework\TestCase;

class ApiIndexTest extends TestCase
{
    public function testApiBootstrapMapsTheHelperInterfaceBeforeLoadingOpenWrtHelper(): void
    {
        $source = file_get_contents(__DIR__ . '/../api/index.php');

        $this->assertIsString($source);
        $this->assertStringContainsString(
            "'frieren\\\\helper\\\\HelperInterface' => __DIR__ . '/helper/HelperInterface.php'",
            $source
        );
    }
}
