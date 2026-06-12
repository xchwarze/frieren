import { ClientOptions } from '../node_modules/ttyd/html/src/components/terminal/xterm';
import { FlowControl } from '../node_modules/ttyd/html/src/components/terminal/xterm';
import { ITerminalOptions } from '@xterm/xterm';
import { ITheme } from '@xterm/xterm';

export declare const DEFAULT_CLIENT_OPTIONS: ClientOptions;

export declare const DEFAULT_FLOW_CONTROL: FlowControl;

export declare const DEFAULT_TERM_OPTIONS: ITerminalOptions;

export declare const DEFAULT_THEME: ITheme;

export declare class FrierenTerminal {
    private disposables;
    private textEncoder;
    private textDecoder;
    private written;
    private pending;
    private terminal;
    private fitAddon;
    private overlayAddon;
    private webglAddon?;
    private zmodemAddon?;
    private socket?;
    private opened;
    private resizeOverlay;
    private reconnect;
    private doReconnect;
    private writeFunc;
    private wsUrl;
    private clientOptions;
    private flowControl;
    private sendCb;
    private statusCb;
    constructor(options: FrierenTerminalOptions);
    open(parent: HTMLElement): void;
    connect(): void;
    fit(): void;
    setTheme(theme: ITheme): void;
    setOptions(options: Partial<ITerminalOptions>): void;
    close(): void;
    dispose(): void;
    sendFile(files: FileList): void;
    private register;
    private onSocketOpen;
    private onSocketClose;
    private onSocketData;
    private initListeners;
    writeData: (data: string | Uint8Array) => void;
    sendData: (data: string | Uint8Array) => void;
    private onWindowUnload;
    private applyPreferences;
    private setRendererType;
    private dispatchStatus;
}

export declare interface FrierenTerminalOptions {
    wsUrl: string;
    termOptions?: ITerminalOptions;
    clientOptions?: Partial<ClientOptions>;
    flowControl?: Partial<FlowControl>;
    onSendFile?: () => void;
    onStatusChange?: (status: TerminalStatus) => void;
}

export { ITheme }

export declare const TERMINAL_STATUS_EVENT = "ws-terminal";

/**
 * Map of terminal theme identifiers to their ITheme color definitions. Shared so
 * any consumer (the panel terminal or a module's TerminalLiteViewer) renders the
 * same operator-selected scheme.
 */
export declare const TERMINAL_THEMES: Record<string, ITheme>;

/**
 * Render-only terminal view: an xterm surface you write text / ANSI into, with
 * NO websocket, input, zmodem, flow-control or webgl. Purpose-built for showing
 * read-only tool output (logs, ANSI-coloured captures) inside a panel — far
 * lighter than {@link FrierenTerminal}, which is the full ttyd client.
 *
 * Lifecycle: `open(el)` once, then `set(text)` per refresh (or `write` to append);
 * call `fit()` on container resize and `dispose()` on unmount.
 */
export declare class TerminalLiteViewer {
    private terminal;
    private fitAddon;
    constructor(options?: TerminalLiteViewerOptions);
    open(parent: HTMLElement): void;
    /** Append data to the view. */
    write(data: string | Uint8Array): void;
    /** Replace the whole view (use for re-read/polled snapshots so nothing stacks). */
    set(data: string | Uint8Array): void;
    clear(): void;
    fit(): void;
    setTheme(theme: ITheme): void;
    dispose(): void;
}

export declare interface TerminalLiteViewerOptions {
    termOptions?: ITerminalOptions;
    theme?: ITheme;
}

export declare type TerminalStatus = 'initializing' | 'connected' | 'reconnected' | 'disconnected' | 'reconnecting';

export { }
