<?php
/*
 * Project: Frieren Framework
 * Tests for UciConfigHelper::readConfig()'s parser. Mocks `file_exists`/`file`
 * inside `namespace frieren\helper` so this runs against a fixture without ever
 * touching the real (root-only, OpenWrt-only) /etc/config/ path.
 */

namespace frieren\helper;

use PHPUnit\Framework\TestCase;
use phpmock\phpunit\PHPMock;

class UciConfigHelperTest extends TestCase
{
    use PHPMock;

    private function fakeFile(array $lines): void
    {
        $this->getFunctionMock(__NAMESPACE__, 'file_exists')->expects($this->once())->willReturn(true);
        $this->getFunctionMock(__NAMESPACE__, 'file')->expects($this->once())->willReturn($lines);
    }

    public function testReadConfigParsesANamedSectionWithQuotedOptions(): void
    {
        $this->fakeFile([
            "config interface 'lan'",
            "\toption ifname 'eth0'",
            "\toption proto 'static'",
        ]);

        $config = UciConfigHelper::readConfig('network');

        $this->assertSame('eth0', $config['lan']['ifname']);
        $this->assertSame('static', $config['lan']['proto']);
    }

    public function testReadConfigIndexesAnonymousSectionsPerTypeInFileOrder(): void
    {
        $this->fakeFile([
            "config wifi-iface",
            "\toption device 'radio0'",
            "config wifi-iface",
            "\toption device 'radio1'",
        ]);

        $config = UciConfigHelper::readConfig('wireless');

        $this->assertSame('radio0', $config['@wifi-iface[0]']['device']);
        $this->assertSame('radio1', $config['@wifi-iface[1]']['device']);
    }

    public function testReadConfigCollectsRepeatedListOptionsIntoAnArray(): void
    {
        $this->fakeFile([
            "config interface 'lan'",
            "\tlist dns '1.1.1.1'",
            "\tlist dns '8.8.8.8'",
        ]);

        $config = UciConfigHelper::readConfig('network');

        $this->assertSame(['1.1.1.1', '8.8.8.8'], $config['lan']['dns']);
    }

    public function testReadConfigConvertsTrueFalseUnsetSpecialValues(): void
    {
        $this->fakeFile([
            "config interface 'lan'",
            "\toption enabled 'TRUE'",
            "\toption disabled 'FALSE'",
            "\toption gateway 'UNSET'",
        ]);

        $config = UciConfigHelper::readConfig('network');

        $this->assertTrue($config['lan']['enabled']);
        $this->assertFalse($config['lan']['disabled']);
        $this->assertNull($config['lan']['gateway']);
    }

    public function testReadConfigIgnoresBlankLinesAndComments(): void
    {
        $this->fakeFile([
            "# a leading comment",
            "",
            "config interface 'lan'",
            "\t# an indented comment",
            "\toption ifname 'eth0'",
            "",
        ]);

        $config = UciConfigHelper::readConfig('network');

        $this->assertSame(['ifname' => 'eth0'], $config['lan']);
    }

    public function testReadConfigThrowsWhenTheFileDoesNotExist(): void
    {
        $this->getFunctionMock(__NAMESPACE__, 'file_exists')->expects($this->once())->willReturn(false);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Configuration file does not exist');

        UciConfigHelper::readConfig('nonexistent');
    }

    public function testUciGetConvertsSpecialValuesAndEscapesTheQuery(): void
    {
        $captured = null;
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) use (&$captured) {
            $captured = $command;
            $retval = 0;
            return 'TRUE';
        });

        $result = UciConfigHelper::uciGet("network.lan.enabled; rm -rf /");

        $this->assertTrue($result);
        $this->assertStringContainsString(escapeshellarg("network.lan.enabled; rm -rf /"), $captured);
    }

    public function testUciGetReturnsNullInsteadOfThrowingWhenToldNotTo(): void
    {
        $exec = $this->getFunctionMock(__NAMESPACE__, 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($command, &$output = null, &$retval = null) {
            $retval = 1;
            return '';
        });

        $this->assertNull(UciConfigHelper::uciGet('network.missing', false));
    }
}
