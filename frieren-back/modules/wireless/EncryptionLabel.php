<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\wireless;

/**
 * Translates a UCI `option encryption` value (OpenWrt's own wire format, e.g.
 * 'psk2+ccmp', 'sae-mixed') into a human-readable label for display. Covers every
 * value hostapd/wpa_supplicant accept, not just the ones this panel's own Add/Edit
 * Interface form writes -- a config can predate this panel or be edited by hand.
 */
final class EncryptionLabel
{
    private const LABELS = [
        'none'                => 'Open',
        'wep-open'            => 'WEP (Open)',
        'wep-shared'          => 'WEP (Shared)',
        'owe'                 => 'Enhanced Open (OWE)',
        'psk'                 => 'WPA-PSK (TKIP)',
        'psk+tkip'            => 'WPA-PSK (TKIP)',
        'psk+ccmp'            => 'WPA-PSK (CCMP)',
        'psk+tkip+ccmp'       => 'WPA-PSK (TKIP+CCMP)',
        'psk2'                => 'WPA2-PSK (CCMP)',
        'psk2+tkip'           => 'WPA2-PSK (TKIP)',
        'psk2+ccmp'           => 'WPA2-PSK (CCMP)',
        'psk2+tkip+ccmp'      => 'WPA2-PSK (TKIP+CCMP)',
        'psk-mixed'           => 'WPA/WPA2-PSK Mixed (TKIP+CCMP)',
        'psk-mixed+tkip'      => 'WPA/WPA2-PSK Mixed (TKIP)',
        'psk-mixed+ccmp'      => 'WPA/WPA2-PSK Mixed (CCMP)',
        'psk-mixed+tkip+ccmp' => 'WPA/WPA2-PSK Mixed (TKIP+CCMP)',
        'wpa'                 => 'WPA-EAP (TKIP)',
        'wpa2'                => 'WPA2-EAP (CCMP)',
        'wpa-mixed'           => 'WPA/WPA2-EAP Mixed',
        'sae'                 => 'WPA3-SAE',
        'sae-mixed'           => 'WPA2/WPA3-SAE Mixed',
    ];

    /**
     * Render the raw UCI encryption string as a human-readable label.
     *
     * @param mixed $encryption Raw `option encryption` value.
     * @return string The human label, or the raw value unchanged if not recognized.
     */
    public static function format($encryption): string
    {
        $encryption = (string)$encryption;

        return self::LABELS[$encryption] ?? $encryption;
    }
}
