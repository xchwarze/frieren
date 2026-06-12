import type { ITerminalOptions, ITheme } from '@xterm/xterm';
import type { ClientOptions, FlowControl } from 'ttyd/html/src/components/terminal/xterm';

export const DEFAULT_THEME: ITheme = {
    foreground: '#d2d2d2',
    background: '#2b2b2b',
    cursor: '#adadad',
    black: '#000000',
    red: '#ff6a45',
    green: '#5ea702',
    yellow: '#cfae00',
    blue: '#5197dd',
    magenta: '#b283b8',
    cyan: '#00a7aa',
    white: '#dbded8',
    brightBlack: '#91948e',
    brightRed: '#ff5745',
    brightGreen: '#99e343',
    brightYellow: '#fdeb61',
    brightBlue: '#84b0d8',
    brightMagenta: '#bc94b7',
    brightCyan: '#37e6e8',
    brightWhite: '#f1f1f0',
};

export const DEFAULT_TERM_OPTIONS: ITerminalOptions = {
    fontSize: 13,
    fontFamily: 'Consolas,Liberation Mono,Menlo,Courier,monospace',
    theme: DEFAULT_THEME,
    allowProposedApi: true,
};

export const DEFAULT_CLIENT_OPTIONS: ClientOptions = {
    rendererType: 'webgl',
    disableLeaveAlert: false,
    disableResizeOverlay: false,
    enableZmodem: false,
    enableTrzsz: false,
    isWindows: false,
    trzszDragInitTimeout: 0,
    unicodeVersion: '11',
};

export const DEFAULT_FLOW_CONTROL: FlowControl = {
    limit: 100000,
    highWater: 10,
    lowWater: 4,
};
