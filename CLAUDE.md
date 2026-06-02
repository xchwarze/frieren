# Frieren

Micro-framework for security gadgets on OpenWrt routers/SBCs. PHP backend + React frontend.
Licensed LGPL-3.0-only. Lead dev: DSR! (xchwarze@gmail.com).

## Project Structure

```
frieren/
├── frieren-back/          # PHP API backend (micro-framework)
├── frieren-front/         # React SPA frontend (Vite)
├── frieren-module-template/ # Scaffolding for third-party modules
├── frieren-terminal/      # Modified ttyd frontend (xterm.js)
└── tools/                 # Dev proxy + PHP minifier
```

## Components

### Backend (`frieren-back/`)
PHP micro-framework. JSON POST API with session auth + CSRF. Modular architecture — each feature is a module with controller + OS helper. See **`frieren-back/CLAUDE.md`** for full detail.

**Key:** All requests are `POST /api/index.php` with `{module, action, ...params}`.

### Frontend (`frieren-front/`)
React 18 SPA (Vite 5, no TypeScript). Feature-based structure with Wouter routing, Jotai state, React Query data fetching. Supports dynamic UMD modules. See **`frieren-front/CLAUDE.md`** for full detail.

**Key:** Hash-based routing (`#/dashboard`, `#/modules`, etc.). All API calls via `fetchPost()`.

### Module Template (`frieren-module-template/`)
Scaffolding for creating third-party modules. Includes example controller, helper, manifest, and Vite config for building UMD frontend bundles.

### Terminal (`frieren-terminal/`)
Modified ttyd web terminal frontend. Webpack + TypeScript + xterm.js. Builds inlined HTML (`html.h`) for the ttyd C binary.

### Tools (`tools/`)
- **`api-proxy.php`** — Dev proxy for frontend: forwards `/api/*` requests from Vite dev server to hardware device at `192.168.7.1:5000`. Handles PHPSESSID/XSRF-TOKEN cookie forwarding. Run with `php -S localhost:8000`.
- **`api-test.sh`** — CLI helper for testing backend APIs via curl. Manages login session (cookies/XSRF). Usage: `./api-test.sh login` then `./api-test.sh req '{"module":"...","action":"..."}'`. Supports `-s SLEEP` for polling, `-o FILE` for saving response.
- **`deploy.sh`** — Deploys backend or frontend to device via SCP. Usage: `./deploy.sh back|front [host] [password]`. Backend deploys `api/` core + `modules/` to `/usr/share/frieren`. Frontend builds prod, compresses assets, and deploys `dist/`.
- **`ssh-cmd.sh`** — Run a command on device via SSH. Usage: `./ssh-cmd.sh "command" [host] [password]`. Uses SSH_ASKPASS for non-interactive password auth.
- **`api-clean.php`** — PHP comment/whitespace stripper for production builds.

## Architecture Overview

```
Browser (React SPA)
  ↓ JSON POST {module, action, ...params}
/api/index.php → ApiCore → Router → {Module}Controller → ModuleOpenWrtHelper
  ↓                                                        ↓
ResponseHandler (JSON)                              OpenWrt system commands
```

- **Auth:** Session-based + CSRF cookie token
- **Modules:** Discoverable via `manifest.json`, installable from remote GitHub repo
- **Storage:** Internal (`/frieren/modules/`) or SD card (`/sd/modules/`)
- **Config:** UCI (OpenWrt Unified Configuration Interface)
- **Platform:** OpenWrt only (extensible via `HelperInterface`)

## Development

```bash
# Frontend dev (from frieren-front/)
yarn dev

# Backend proxy (from tools/)
php -S localhost:8000

# Production build (from frieren-front/)
yarn build

# Release build (from frieren-front/)
yarn build --mode release
```

## Module Development

Each module needs:
1. `{Name}Controller.php` — extends `\frieren\core\Controller`, defines `$endpointRoutes`
2. `ModuleOpenWrtHelper.php` — static methods for OS-level operations
3. `manifest.json` — metadata (name, title, icon, version, etc.)
4. Optional: UMD frontend bundle built with `frieren-module-template`

Third-party modules go in `frieren-modules` repo.
