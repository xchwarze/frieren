declare module 'ttyd/html/src/components/terminal/xterm/addons/overlay' {
    import type { ITerminalAddon, Terminal } from '@xterm/xterm';

    export class OverlayAddon implements ITerminalAddon {
        activate(terminal: Terminal): void;
        dispose(): void;
        showOverlay(msg: string, timeout?: number): void;
    }
}

declare module 'ttyd/html/src/components/terminal/xterm/addons/zmodem' {
    import type { ITerminalAddon, Terminal } from '@xterm/xterm';

    export interface ZmodeOptions {
        zmodem: boolean;
        trzsz: boolean;
        windows: boolean;
        trzszDragInitTimeout: number;
        onSend: () => void;
        sender: (data: string | Uint8Array) => void;
        writer: (data: string | Uint8Array) => void;
    }

    export class ZmodemAddon implements ITerminalAddon {
        constructor(options: ZmodeOptions);
        activate(terminal: Terminal): void;
        dispose(): void;
        consume(data: ArrayBuffer): void;
        sendFile(files: FileList): void;
    }
}

declare module 'ttyd/html/src/components/terminal/xterm' {
    export type RendererType = 'dom' | 'canvas' | 'webgl';

    export interface ClientOptions {
        rendererType: RendererType;
        disableLeaveAlert: boolean;
        disableResizeOverlay: boolean;
        enableZmodem: boolean;
        enableTrzsz: boolean;
        isWindows: boolean;
        trzszDragInitTimeout: number;
        unicodeVersion: string;
    }

    export interface FlowControl {
        limit: number;
        highWater: number;
        lowWater: number;
    }
}
