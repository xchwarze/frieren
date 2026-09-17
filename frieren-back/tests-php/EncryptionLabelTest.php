<?php
/*
 * Project: Frieren Framework
 * Pure lookup logic, no mocking needed.
 */

namespace frieren\modules\wireless;

use PHPUnit\Framework\TestCase;

class EncryptionLabelTest extends TestCase
{
    public function testFormatTranslatesOpenAndCommonPskValues(): void
    {
        $this->assertSame('Open', EncryptionLabel::format('none'));
        $this->assertSame('WPA2-PSK (CCMP)', EncryptionLabel::format('psk2'));
        $this->assertSame('WPA2-PSK (CCMP)', EncryptionLabel::format('psk2+ccmp'));
        $this->assertSame('WPA-PSK (TKIP)', EncryptionLabel::format('psk'));
        $this->assertSame('WPA/WPA2-PSK Mixed (CCMP)', EncryptionLabel::format('psk-mixed+ccmp'));
    }

    public function testFormatTranslatesWpa3AndOwe(): void
    {
        $this->assertSame('WPA3-SAE', EncryptionLabel::format('sae'));
        $this->assertSame('WPA2/WPA3-SAE Mixed', EncryptionLabel::format('sae-mixed'));
        $this->assertSame('Enhanced Open (OWE)', EncryptionLabel::format('owe'));
    }

    public function testFormatReturnsAnUnrecognizedValueUnchanged(): void
    {
        $this->assertSame('some-future-suite', EncryptionLabel::format('some-future-suite'));
    }

    public function testFormatCoercesANonStringInputToString(): void
    {
        $this->assertSame('', EncryptionLabel::format(null));
    }
}
