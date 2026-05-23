import type { IDisposable, ITerminalOptions, ITheme } from '@xterm/xterm';
import { Terminal } from '@xterm/xterm';
import { CanvasAddon } from '@xterm/addon-canvas';
import { WebglAddon } from '@xterm/addon-webgl';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ImageAddon } from '@xterm/addon-image';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import { OverlayAddon } from 'ttyd/html/src/components/terminal/xterm/addons/overlay';
import { ZmodemAddon } from 'ttyd/html/src/components/terminal/xterm/addons/zmodem';
import type { ClientOptions, FlowControl, RendererType } from 'ttyd/html/src/components/terminal/xterm';

import '@xterm/xterm/css/xterm.css';

import { DEFAULT_TERM_OPTIONS, DEFAULT_CLIENT_OPTIONS, DEFAULT_FLOW_CONTROL } from './defaults';

export type TerminalStatus = 'initializing' | 'connected' | 'reconnected' | 'disconnected' | 'reconnecting';

export interface FrierenTerminalOptions {
    wsUrl: string;
    termOptions?: ITerminalOptions;
    clientOptions?: Partial<ClientOptions>;
    flowControl?: Partial<FlowControl>;
    onSendFile?: () => void;
}

enum ServerCommand {
    OUTPUT = '0',
    SET_WINDOW_TITLE = '1',
    SET_PREFERENCES = '2',
}

enum ClientCommand {
    INPUT = '0',
    RESIZE_TERMINAL = '1',
    PAUSE = '2',
    RESUME = '3',
}

type Preferences = ITerminalOptions & ClientOptions;

function toDisposable(f: () => void): IDisposable {
    return { dispose: f };
}

function addListener(target: EventTarget, type: string, listener: EventListener): IDisposable {
    target.addEventListener(type, listener);
    return toDisposable(() => target.removeEventListener(type, listener));
}

export class FrierenTerminal {
    private disposables: IDisposable[] = [];
    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder();
    private written = 0;
    private pending = 0;

    private terminal: Terminal;
    private fitAddon = new FitAddon();
    private overlayAddon = new OverlayAddon();
    private webglAddon?: WebglAddon;
    private canvasAddon?: CanvasAddon;
    private zmodemAddon?: ZmodemAddon;

    private socket?: WebSocket;
    private opened = false;
    private title?: string;
    private titleFixed?: string;
    private resizeOverlay = true;
    private reconnect = true;
    private doReconnect = true;

    private writeFunc = (data: ArrayBuffer) => this.writeData(new Uint8Array(data));

    private wsUrl: string;
    private clientOptions: ClientOptions;
    private flowControl: FlowControl;
    private sendCb: () => void;

    constructor(options: FrierenTerminalOptions) {
        this.wsUrl = options.wsUrl;
        this.clientOptions = { ...DEFAULT_CLIENT_OPTIONS, ...options.clientOptions } as ClientOptions;
        this.flowControl = { ...DEFAULT_FLOW_CONTROL, ...options.flowControl } as FlowControl;
        this.sendCb = options.onSendFile ?? (() => {});

        const termOptions = { ...DEFAULT_TERM_OPTIONS, ...options.termOptions };
        this.terminal = new Terminal(termOptions);
    }

    open(parent: HTMLElement) {
        const { terminal, fitAddon, overlayAddon } = this;

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(overlayAddon);
        terminal.loadAddon(new WebLinksAddon());

        terminal.open(parent);
        fitAddon.fit();
    }

    connect() {
        this.socket = new WebSocket(this.wsUrl, ['tty']);
        const { socket } = this;
        this.dispatchStatus('initializing');

        socket.binaryType = 'arraybuffer';
        this.register(addListener(socket, 'open', this.onSocketOpen));
        this.register(addListener(socket, 'message', this.onSocketData as EventListener));
        this.register(addListener(socket, 'close', this.onSocketClose as EventListener));
        this.register(addListener(socket, 'error', () => (this.doReconnect = false)));
    }

    fit() {
        this.fitAddon.fit();
    }

    setTheme(theme: ITheme) {
        this.terminal.options.theme = theme;
    }

    setOptions(options: Partial<ITerminalOptions>) {
        const { terminal, fitAddon } = this;
        let needsFit = false;

        for (const [key, value] of Object.entries(options)) {
            (terminal.options as Record<string, unknown>)[key] = value;
            if (key.startsWith('font')) {
                needsFit = true;
            }
        }

        if (needsFit) {
            fitAddon.fit();
        }
    }

    dispose() {
        this.doReconnect = false;
        this.socket?.close(1000);
        this.socket = undefined;
        for (const d of this.disposables) {
            d.dispose();
        }
        this.disposables.length = 0;
    }

    sendFile(files: FileList) {
        this.zmodemAddon?.sendFile(files);
    }

    private register = <T extends IDisposable>(d: T): T => {
        this.disposables.push(d);
        return d;
    }

    private onSocketOpen = () => {
        console.log('[frieren-terminal] websocket connection opened');

        const { textEncoder, terminal, overlayAddon } = this;
        const msg = JSON.stringify({ columns: terminal.cols, rows: terminal.rows });
        this.socket?.send(textEncoder.encode(msg));

        if (this.opened) {
            terminal.reset();
            terminal.options.disableStdin = false;
            overlayAddon.showOverlay('Reconnected', 300);
            this.dispatchStatus('reconnected');
        } else {
            this.opened = true;
            this.dispatchStatus('connected');
        }

        this.doReconnect = this.reconnect;
        this.initListeners();
        terminal.focus();
    }

    private onSocketClose = (event: CloseEvent) => {
        console.log(`[frieren-terminal] websocket connection closed with code: ${event.code}`);

        const { doReconnect, overlayAddon } = this;
        overlayAddon.showOverlay('Connection Closed');
        this.dispose();
        this.dispatchStatus('disconnected');

        if (event.code !== 1000 && doReconnect) {
            overlayAddon.showOverlay('Reconnecting...');
            this.connect();
            this.dispatchStatus('reconnecting');
        } else {
            const { terminal, register } = this;
            const keyDispose = register(terminal.onKey(e => {
                if (e.domEvent.key === 'Enter') {
                    keyDispose.dispose();
                    overlayAddon.showOverlay('Reconnecting...');
                    this.connect();
                }
            }));
            overlayAddon.showOverlay('Press ⏎ to Reconnect');
        }
    }

    private onSocketData = (event: MessageEvent) => {
        const { textDecoder } = this;
        const rawData = event.data as ArrayBuffer;
        const cmd = String.fromCharCode(new Uint8Array(rawData)[0]);
        const data = rawData.slice(1);

        switch (cmd) {
            case ServerCommand.OUTPUT:
                this.writeFunc(data);
                break;
            case ServerCommand.SET_WINDOW_TITLE:
                this.title = textDecoder.decode(data);
                document.title = this.title;
                break;
            case ServerCommand.SET_PREFERENCES:
                this.applyPreferences({
                    ...this.clientOptions,
                    ...JSON.parse(textDecoder.decode(data)),
                } as Preferences);
                break;
            default:
                console.warn(`[frieren-terminal] unknown command: ${cmd}`);
                break;
        }
    }

    private initListeners = () => {
        const { terminal, fitAddon, overlayAddon, register } = this;
        register(
            terminal.onTitleChange(data => {
                if (data && data !== '' && !this.titleFixed) {
                    document.title = data + ' | ' + this.title;
                }
            })
        );
        register(terminal.onData(data => this.sendData(data)));
        register(terminal.onBinary(data => this.sendData(Uint8Array.from(data, v => v.charCodeAt(0)))));
        register(
            terminal.onResize(({ cols, rows }) => {
                const msg = JSON.stringify({ columns: cols, rows: rows });
                this.socket?.send(this.textEncoder.encode(ClientCommand.RESIZE_TERMINAL + msg));
                if (this.resizeOverlay) overlayAddon.showOverlay(`${cols}x${rows}`, 300);
            })
        );
        register(
            terminal.onSelectionChange(() => {
                if (this.terminal.getSelection() === '') return;
                try {
                    document.execCommand('copy');
                } catch {
                    // ignore
                }
                this.overlayAddon?.showOverlay('✂', 200);
            })
        );
        register(addListener(window, 'resize', () => fitAddon.fit()));
        register(addListener(window, 'beforeunload', this.onWindowUnload));
    }

    writeData = (data: string | Uint8Array) => {
        const { terminal, textEncoder } = this;
        const { limit, highWater, lowWater } = this.flowControl;

        this.written += data.length;
        if (this.written > limit) {
            terminal.write(data, () => {
                this.pending = Math.max(this.pending - 1, 0);
                if (this.pending < lowWater) {
                    this.socket?.send(textEncoder.encode(ClientCommand.RESUME));
                }
            });
            this.pending++;
            this.written = 0;
            if (this.pending > highWater) {
                this.socket?.send(textEncoder.encode(ClientCommand.PAUSE));
            }
        } else {
            terminal.write(data);
        }
    }

    sendData = (data: string | Uint8Array) => {
        const { socket, textEncoder } = this;
        if (socket?.readyState !== WebSocket.OPEN) return;

        if (typeof data === 'string') {
            const payload = new Uint8Array(data.length * 3 + 1);
            payload[0] = ClientCommand.INPUT.charCodeAt(0);
            const stats = textEncoder.encodeInto(data, payload.subarray(1));
            socket.send(payload.subarray(0, (stats.written as number) + 1));
        } else {
            const payload = new Uint8Array(data.length + 1);
            payload[0] = ClientCommand.INPUT.charCodeAt(0);
            payload.set(data, 1);
            socket.send(payload);
        }
    }

    private onWindowUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        if (this.socket?.readyState === WebSocket.OPEN) {
            const message = 'Close terminal? this will also terminate the command.';
            event.returnValue = message;
            return message;
        }
        return undefined;
    }

    private applyPreferences = (prefs: Preferences) => {
        const { terminal, fitAddon, register } = this;
        if (prefs.enableZmodem || prefs.enableTrzsz) {
            this.zmodemAddon = new ZmodemAddon({
                zmodem: prefs.enableZmodem,
                trzsz: prefs.enableTrzsz,
                windows: prefs.isWindows,
                trzszDragInitTimeout: prefs.trzszDragInitTimeout,
                onSend: this.sendCb,
                sender: this.sendData,
                writer: this.writeData,
            });
            this.writeFunc = data => this.zmodemAddon?.consume(data);
            terminal.loadAddon(register(this.zmodemAddon));
        }

        for (const [key, value] of Object.entries(prefs)) {
            switch (key) {
                case 'rendererType':
                    this.setRendererType(value as RendererType);
                    break;
                case 'disableLeaveAlert':
                    if (value) {
                        window.removeEventListener('beforeunload', this.onWindowUnload);
                        console.log('[frieren-terminal] Leave site alert disabled');
                    }
                    break;
                case 'disableResizeOverlay':
                    if (value) {
                        this.resizeOverlay = false;
                    }
                    break;
                case 'disableReconnect':
                    if (value) {
                        this.reconnect = false;
                        this.doReconnect = false;
                    }
                    break;
                case 'enableZmodem':
                case 'enableTrzsz':
                case 'trzszDragInitTimeout':
                case 'isWindows':
                    break;
                case 'enableSixel':
                    if (value) {
                        terminal.loadAddon(register(new ImageAddon()));
                    }
                    break;
                case 'titleFixed':
                    if (!value || value === '') return;
                    this.titleFixed = value as string;
                    document.title = value as string;
                    break;
                case 'unicodeVersion':
                    if (value === 11 || value === '11') {
                        terminal.loadAddon(new Unicode11Addon());
                        terminal.unicode.activeVersion = '11';
                    }
                    break;
                default:
                    const opts = terminal.options as Record<string, unknown>;
                    if (opts[key] instanceof Object) {
                        opts[key] = Object.assign({}, opts[key], value);
                    } else {
                        opts[key] = value;
                    }
                    if (key.indexOf('font') === 0) fitAddon.fit();
                    break;
            }
        }
    }

    private setRendererType(value: RendererType) {
        const { terminal } = this;
        const disposeCanvas = () => {
            try { this.canvasAddon?.dispose(); } catch { /* ignore */ }
            this.canvasAddon = undefined;
        };
        const disposeWebgl = () => {
            try { this.webglAddon?.dispose(); } catch { /* ignore */ }
            this.webglAddon = undefined;
        };
        const enableCanvas = () => {
            if (this.canvasAddon) return;
            this.canvasAddon = new CanvasAddon();
            disposeWebgl();
            try {
                terminal.loadAddon(this.canvasAddon);
            } catch {
                disposeCanvas();
            }
        };
        const enableWebgl = () => {
            if (this.webglAddon) return;
            this.webglAddon = new WebglAddon();
            disposeCanvas();
            try {
                this.webglAddon.onContextLoss(() => this.webglAddon?.dispose());
                terminal.loadAddon(this.webglAddon);
            } catch {
                disposeWebgl();
                enableCanvas();
            }
        };

        switch (value) {
            case 'canvas': enableCanvas(); break;
            case 'webgl': enableWebgl(); break;
            case 'dom':
                disposeWebgl();
                disposeCanvas();
                break;
        }
    }

    private dispatchStatus(status: TerminalStatus) {
        window.dispatchEvent(new CustomEvent('ws-terminal', { detail: { status } }));
    }
}
