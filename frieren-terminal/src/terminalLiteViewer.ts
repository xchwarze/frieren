/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import type { ITerminalOptions, ITheme } from '@xterm/xterm';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

import '@xterm/xterm/css/xterm.css';

import { DEFAULT_TERM_OPTIONS, DEFAULT_THEME } from './defaults';

export interface TerminalLiteViewerOptions {
    termOptions?: ITerminalOptions;
    theme?: ITheme;
}

/**
 * Render-only terminal view: an xterm surface you write text / ANSI into, with
 * NO websocket, input, zmodem, flow-control or webgl. Purpose-built for showing
 * read-only tool output (logs, ANSI-coloured captures) inside a panel — far
 * lighter than {@link FrierenTerminal}, which is the full ttyd client.
 *
 * Lifecycle: `open(el)` once, then feed output one of two ways — `write(text)` to
 * append (streamed/drained deltas) or `set(text)` to replace the whole view (full
 * snapshots polled each refresh, so nothing stacks). Call `fit()` on container
 * resize, `clear()` to reset, and `dispose()` on unmount.
 */
export class TerminalLiteViewer {
    private terminal: Terminal;
    private fitAddon = new FitAddon();

    constructor(options: TerminalLiteViewerOptions = {}) {
        this.terminal = new Terminal({
            ...DEFAULT_TERM_OPTIONS,
            disableStdin: true,
            cursorBlink: false,
            // Log/file output carries bare "\n" (it is not a tty), so map LF -> CRLF
            // or each line keeps the previous line's column (staircase). The
            // interactive FrierenTerminal must NOT do this (it gets real CRLF).
            convertEol: true,
            ...options.termOptions,
            theme: options.theme ?? DEFAULT_THEME,
        });

        // Read-only view: never consume keystrokes. Returning false stops xterm from
        // processing (and preventDefault-ing) the key, so it bubbles to the browser —
        // F12/devtools and other shortcuts keep working even with the view focused.
        // Mouse text selection / copy still work.
        this.terminal.attachCustomKeyEventHandler(() => false);
    }

    open(parent: HTMLElement): void {
        this.terminal.loadAddon(this.fitAddon);
        this.terminal.open(parent);
        this.fitAddon.fit();
    }

    /** Append data to the view. */
    write(data: string | Uint8Array): void {
        this.terminal.write(data);
    }

    /** Replace the whole view (use for re-read/polled snapshots so nothing stacks). */
    set(data: string | Uint8Array): void {
        this.terminal.reset();
        this.terminal.write(data);
    }

    clear(): void {
        this.terminal.clear();
    }

    fit(): void {
        this.fitAddon.fit();
    }

    setTheme(theme: ITheme): void {
        this.terminal.options.theme = theme;
    }

    dispose(): void {
        this.terminal.dispose();
    }
}
