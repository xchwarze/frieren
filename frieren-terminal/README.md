# @frieren/terminal-core

Framework-agnostic terminal library for Frieren. Wraps [xterm.js](https://xtermjs.org/) with WebSocket-based ttyd protocol support.

## What this is

Originally `frieren-terminal` contained a modified copy of [ttyd's frontend](https://github.com/tsl0922/ttyd) (tag 1.7.7). This library replaces that approach:

- **ttyd is now a yarn dependency** — upstream sources stay untouched in `node_modules/ttyd/`
- **`FrierenTerminal` class** reimplements the terminal core with Frieren-specific modifications baked in (no token auth, configurable WebSocket URL, status events via `CustomEvent('ws-terminal')`)
- **Reuses ttyd addons** (OverlayAddon, ZmodemAddon) directly from the dependency
- **`frieren-modifications.patch`** is kept as historical reference of the original changes

## Usage

```typescript
import { FrierenTerminal } from '@frieren/terminal-core';

const term = new FrierenTerminal({
    wsUrl: 'ws://192.168.7.1:1477/ws',
});

term.open(document.getElementById('terminal'));
term.connect();
```

## Structure

```
src/
├── index.ts          # Barrel export
├── defaults.ts       # Default theme, terminal options, client options, flow control
├── terminal.ts       # FrierenTerminal class
└── typings/
    └── ttyd.d.ts     # Type declarations for ttyd dependency imports
```

## Disabled features

The following ttyd features are disabled to reduce bundle size:

- **Sixel image rendering** (`@xterm/addon-image`) — inline image display in terminal
- **Canvas renderer** (`@xterm/addon-canvas`) — falls back to DOM renderer if WebGL is unavailable

## Development

```bash
yarn install
yarn tsc --noEmit   # Type check
```
