# Frieren Web Frontend

React SPA for Frieren security gadget framework. Runs on OpenWrt routers/SBCs. Communicates with PHP backend via JSON POST.

## Tech Stack

- **React 18** (JSX, hooks, no TypeScript)
- **Vite 5** (build + dev server)
- **Wouter** — lightweight hash-based routing
- **Jotai** — atomic state management (`atom`, `atomWithStorage`)
- **@tanstack/react-query v5** — server state, caching, mutations
- **react-hook-form + yup** — form handling + validation
- **Bootstrap 5.3 + react-bootstrap** — UI components + styling
- **react-toastify** — toast notifications
- **react-error-boundary** — error boundaries
- **re-resizable** — resizable terminal panel
- **Yarn** (berry) — package manager
- **fantasticon** — custom icon font generation

## Commands

```bash
cp config/.env.dev .env && yarn dev    # Dev server (proxy to device at localhost:8000)
cp config/.env.prod .env && yarn build # Production build
yarn lint                              # ESLint
yarn generate-icons                    # Regenerate icon font
```

## Dev Proxy

Dev server proxies `/api/*` to `http://localhost:8000/api-proxy.php`. Run the proxy with:
```bash
cd ../tools && php -S localhost:8000
```
Proxy forwards to device at `192.168.7.1:5000`.

## Architecture

### Directory Structure

```
src/
├── main.jsx                    # Entry: UMD setup + ReactDOM render
├── App.jsx                     # Providers: QueryClient > Jotai > Theme > Router > Toast
├── navigation/
│   ├── RouterProvider.jsx      # Auth gate: authAtom ? LoginStack : LogoffStack
│   ├── LoginStack.jsx          # Authenticated routes
│   └── LogoffStack.jsx         # Unauthenticated routes (login only)
├── atoms/                      # Global Jotai atoms
│   ├── authAtom.js             # atomWithStorage('user-logged', false)
│   ├── themeVariantAtom.js     # atomWithStorage — 'auto'|'dark'|'light'
│   ├── sidebarStatusAtom.js    # atomWithStorage — sidebar collapse
│   └── dependencyInstallStatusAtom.js
├── services/
│   ├── fetchService.js         # fetch wrapper: fetchPost, fetchGet, fetchPostDownload
│   └── queryClient.js          # React Query client (gcTime: 15min, staleTime: 10min)
├── hooks/                      # Global hooks
│   ├── useAuthenticatedQuery.js    # useQuery wrapper + auth error handling
│   ├── useAuthenticatedMutation.js # useMutation wrapper + auth error handling
│   ├── useHandleError.js       # On "Not Authenticated": clear auth, redirect, toast
│   ├── useRouterRules.js       # Hash-based routing hook for Wouter
│   ├── useModulesList.js       # Fetches dynamic module nav items
│   ├── useScript.js            # Dynamic <script> loader for UMD modules
│   └── ...                     # useApplyTheme, useInterval, useResetMutation, etc.
├── components/                 # Shared UI
│   ├── Layout/                 # Shell: Header + Sidebar + content + Terminal
│   ├── Header/                 # Top navbar
│   ├── Sidebar/                # Left nav (static + dynamic modules)
│   ├── PanelCard/              # Card with title + refresh button + spinner
│   ├── Form/                   # Form system (see Form Patterns below)
│   ├── DynamicModule/          # UMD module loader component
│   ├── Icon/                   # Feather icon renderer
│   ├── ModuleIcon/             # Module icon with fallback
│   ├── ConfirmationModal/      # Generic confirm dialog
│   ├── ErrorFallback/          # Error boundary UI
│   └── ...
├── features/                   # Feature modules (see below)
├── helpers/
│   ├── actionsHelper.js        # openLink, sleep, ucfirst
│   ├── umdSupport.js           # Expose React/Jotai/etc to window for UMD modules
│   ├── queryKeys.js            # Global query key constants
│   └── wdyrSetup.js            # Why-did-you-render dev tool
├── assets/                     # CSS, fonts, images
└── icons/                      # Generated icon files
```

### Feature Module Structure

Each feature in `features/` follows this pattern:
```
features/{name}/
├── containers/{Name}/index.jsx   # Page component
├── components/                   # Feature-specific UI components
├── hooks/                        # useQuery/useMutation hooks
├── atoms/                        # Feature-specific Jotai atoms
└── helpers/queryKeys.js          # Query key constants
```

**Built-in features:** dashboard, login, modules, hardware, settings, terminal, wireless

### Routes (hash-based)

Authenticated (`LoginStack`):
- `#/dashboard` — system stats + info
- `#/modules` — install/remove/pin modules
- `#/hardware` — USB, filesystem, logs, diagnostics
- `#/settings` — hostname, timezone, password, theme
- `#/wireless` — AP config, scan, client connect
- `#/about` — about page
- `#/:moduleName` — dynamic UMD module (catch-all)

Unauthenticated (`LogoffStack`): `#/login` only

## Key Patterns

### API Communication

All backend requests are JSON POST to single endpoint:
```js
fetchPost({ module: 'dashboard', action: 'getSystemStats' })
// POST to VITE_RELATIVE_API_PATH (default: api/index.php)
// credentials: 'include' for session cookies
```

### Query/Mutation Hooks

```js
// Query (data fetching)
const { data, isLoading, refetch } = useAuthenticatedQuery({
    queryKey: [DASHBOARD_GET_SYSTEM_STATS],
    queryFn: () => fetchPost({ module: 'dashboard', action: 'getSystemStats' }),
});

// Mutation (actions)
const mutation = useAuthenticatedMutation({
    mutationFn: (data) => fetchPost({ module: 'settings', action: 'setHostname', ...data }),
    onSuccess: () => toast.success('Saved'),
});
```

Both wrappers auto-handle auth errors (clear session, redirect to login).

### Form Pattern

```jsx
const schema = yup.object({
    hostname: yup.string().required('Required'),
});

<FormProvider schema={schema} onSubmit={mutation.mutateAsync} defaultValues={{ hostname: '' }}>
    <InputField name="hostname" label="Hostname" />
    <SubmitButton label="Save" />
</FormProvider>
```

Form components: `FormProvider`, `InputField`, `SelectField`, `TextAreaField`, `CheckboxField`, `SwitchField`, `SubmitButton`

### State Management

- **Server state**: React Query (caching, refetch, stale/gc times)
- **Client state**: Jotai atoms
- **Persisted atoms**: `atomWithStorage` for auth, theme, sidebar
- **Feature atoms**: local to feature dirs (e.g., `terminalStatusAtom`)

### UMD Module System

External modules loaded dynamically:
1. `useModulesList()` fetches module list from backend
2. Route `/:moduleName` renders `<DynamicModule />`
3. `useScript()` loads `/{VITE_WEB_MODULES_FOLDER}/{name}/module.umd.js`
4. Module must export `window.FrierenModule{Name}()` function
5. Shared libs exposed via `window.*` (React, Jotai, ReactQuery, etc.)

### Theme

Bootstrap `data-bs-theme` attribute. Values: `'dark'`, `'light'`, or auto (system preference). Stored in `themeVariantAtom`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_RELATIVE_API_PATH` | API endpoint path | `api/index.php` |
| `VITE_FULL_API_ENDPOINT` | Full API URL (overrides relative) | — |
| `VITE_WEB_MODULES_FOLDER` | External modules folder | `modules` |
| `VITE_ENABLE_TERMINAL` | Show terminal feature | `true` |
| `VITE_COMPRESSION_ENABLE` | Gzip build output | `true` |
| `VITE_SOURCEMAP` | Generate sourcemaps | `false` |
| `VITE_MANUAL_CHUNKS_ENABLE` | Split vendor chunks | `false` |
| `VITE_ANALYZER_ENABLE` | Bundle analyzer | `false` |

## Build Config (vite.config.js)

- Path aliases: `@src` and `@module` both resolve to `./src`
- No CSS code splitting
- Output: `assets/[name].js`, `assets/[name].[ext]` (no hashes)
- Optional gzip compression plugin
- Optional bundle analyzer plugin
- Dev proxy: `/api/*` → `localhost:8000/api-proxy.php`

## Backend API Reference

All requests: `POST {apiPath}` with JSON body `{ module, action, ...params }`.

| Module | Action | Description |
|---|---|---|
| login | login | Auth with username/password |
| login | logout | Clear session |
| dashboard | getSystemStats | CPU, memory, uptime |
| dashboard | getSystemResume | Board/device info |
| header | shutDownHardware | Shutdown device |
| header | resetHardware | Reboot device |
| header | serverPing | Connectivity check |
| hardware | getUsbDevices | List USB devices |
| hardware | getFileSystemUsage | Disk usage |
| hardware | getSystemLogs | Syslog (optional search) |
| hardware | startDiagnosticsScript | Run diagnostics |
| hardware | getDiagnosticsStatus | Poll diagnostics |
| hardware | downloadDiagnosticsFile | Download report |
| modules | getModuleList | Installed modules (sidebar/external) |
| modules | getAvailableModules | Remote module catalog |
| modules | getInstalledModules | Installed with sizes |
| modules | downloadModule | Download from remote |
| modules | installModule | Install (SHA256 verify) |
| modules | removeModule | Delete module |
| modules | pinModule | Toggle sidebar pin |
| settings | getSectionData | Read config section |
| settings | setHostname | Change hostname |
| settings | setTimezone | Change timezone |
| settings | setUserPassword | Change password |
| settings | setPanelTheme | Change UI theme |
| terminal | startTerminal | Start ttyd on port 1477 |
| terminal | stopTerminal | Kill ttyd |
| terminal | getStatus | Check ttyd running |
| wireless | getWirelessInterfaces | List interfaces |
| wireless | getManagementConfig | AP configuration |
| wireless | setManagementConfig | Update AP config |
| wireless | scanForNetworks | WiFi scan |
| wireless | getClientConfig | Client/WWAN config |
| wireless | setClientConfig | Connect to AP |
| wireless | disableWwanInterface | Disable WWAN |

## Conventions

- JSX files use `.jsx` extension, plain JS use `.js`
- Components export default from `index.jsx`
- Feature isolation: each feature owns its hooks, atoms, components
- Query keys defined as constants in `helpers/queryKeys.js` per feature
- All API calls go through `fetchPost()` from `services/fetchService.js`
- Form validation with Yup schemas, forms with `FormProvider` wrapper
- Toast notifications for success/error feedback
- `PanelCard` wraps most dashboard-style content cards
