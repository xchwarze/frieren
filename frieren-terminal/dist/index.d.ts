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
    constructor(options: FrierenTerminalOptions);
    open(parent: HTMLElement): void;
    connect(): void;
    fit(): void;
    setTheme(theme: ITheme): void;
    setOptions(options: Partial<ITerminalOptions>): void;
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
}

export { ITheme }

export declare type TerminalStatus = 'initializing' | 'connected' | 'reconnected' | 'disconnected' | 'reconnecting';

export { }
