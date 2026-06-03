# Frieren Web Frontend

React SPA for Frieren security gadget framework. Runs on OpenWrt routers/SBCs. Communicates with PHP backend via JSON POST.

## Tech Stack

- **React 18** (JSX, hooks, no TypeScript)
- **Vite 7** (build + dev server)
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
yarn dev                   # Dev server — loads config/.env.dev (proxies to device)
yarn build                 # Production build — loads config/.env.prod
yarn build --mode release  # Release build — loads config/.env.release (gzip replaces originals)
yarn lint                  # ESLint
yarn generate-icons        # Regenerate icon font
```

Vite env files live in `config/` (not project root). Mode mapping in `vite.config.js`: `development` → `.env.dev`, `production` → `.env.prod`, custom modes (e.g. `release`) load `.env.{mode}` as-is. No need to copy `.env` files manually.

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

**Built-in features:** dashboard, login, modules, packages, hardware, settings, terminal, wireless

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

Form components: `FormProvider`, `InputField`, `PasswordHelper`, `SelectField`, `TextAreaField`, `CheckboxField`, `SwitchField`, `SubmitButton`

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
5. Shared libs exposed via `window.Frieren.*` (React, ReactDOM, ReactQuery, Jotai, JotaiUtils, ReactHookForm, HookformResolvers, HookformResolversYup, ReactToastify, ReactBootstrap, ReactContentLoader, PropTypes, Wouter, Yup, jsxRuntime) — set by `helpers/umdSupport.js` before render. Also exposes the `loadingImage` asset (see below).

**Asset inlining gotcha:** Vite library mode inlines ALL imported assets as base64 (ignores `assetsInlineLimit`) — a lib can't reference separate asset files. Module UMDs bundle shared `@src` components (PanelCard, DependenciesAlert, Loading, …) into themselves, so any asset a shared component imports gets base64'd into EVERY module that uses it. Fix: externalize the asset through `window.Frieren` like a lib. `loading.png` is imported in `umdSupport.js` and exposed as `window.Frieren.loadingImage`; the `Loading` component reads that global instead of `import`-ing the PNG, so module bundles stay small. Route any new shared-component asset the same way.

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
| dashboard | getNews | Fetch remote news JSON |
| header | shutDownHardware | Shutdown device |
| header | resetHardware | Reboot device |
| header | serverPing | Connectivity check |
| header | installModuleDependencies | Install module deps |
| header | getDependencyInstallationStatus | Poll dep install status |
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
| modules | downloadStatus | Poll download progress |
| modules | installModule | Install (SHA256 verify) |
| modules | installStatus | Poll install progress |
| modules | checkDestination | Check install destination |
| modules | removeModule | Delete module |
| modules | pinModule | Toggle sidebar pin |
| packages | getAvailablePackagesStatus | Check if package list ready |
| packages | getAvailablePackages | List available packages |
| packages | getInstalledPackages | List installed packages |
| packages | installPackage | Install a package |
| packages | getInstallStatus | Poll install progress |
| packages | removePackage | Remove a package |
| packages | getRemoveStatus | Poll remove progress |
| packages | updateLists | Refresh package lists |
| packages | getUpdateStatus | Poll update progress |
| settings | getSectionData | Read config section |
| settings | setHostname | Change hostname |
| settings | setTimezone | Change timezone |
| settings | setDatetimeFromBrowser | Sync device time from browser |
| settings | setUserPassword | Change password |
| settings | setPanelTheme | Change UI theme |
| terminal | startTerminal | Start ttyd on port 1477 |
| terminal | stopTerminal | Kill ttyd |
| terminal | getStatus | Check ttyd running |
| wireless | getWirelessOverview | Radios + interfaces overview |
| wireless | getInterfaceConfig | Single interface config |
| wireless | setInterfaceConfig | Update interface config |
| wireless | addInterface | Create new interface |
| wireless | removeInterface | Delete interface |
| wireless | toggleInterface | Enable/disable interface |
| wireless | scanForNetworks | WiFi scan |
| wireless | getRadioConfig | Radio hardware config |
| wireless | setRadioConfig | Update radio config |
| wireless | getRawWirelessConfig | Raw UCI wireless file |
| wireless | setRawWirelessConfig | Write raw UCI wireless |
| wireless | resetWirelessConfig | Reset wireless to defaults |
| wireless | getAssociationList | Connected stations list |

## Code Quality

- Write clean, senior-level code. No junior patterns.
- Name variables/constants by purpose, not value (`cacheTTL` not `SIX_HOURS`)
- Extract `import.meta.env.*` to descriptive module-scope variables
- Follow existing codebase patterns — study neighbors before writing new code
- Guard clauses and early returns over deep nesting
- Destructure where it improves clarity, don't over-destructure
- No magic strings/numbers — named constants with semantic names
- Small focused functions — if it needs a comment explaining what it does, split it
- No dead code, no commented-out code, no TODO placeholders
- DRY without over-abstracting — duplicate is better than wrong abstraction
- Consistent with existing project conventions (hooks pattern, query pattern, component structure)
- Think about edge cases: loading, error, empty states
- Keep components lean — extract logic to hooks, extract sub-renders to components when complex
- Prefer composition over conditional spaghetti

## Conventions

- JSX files use `.jsx` extension, plain JS use `.js`
- Components export default from `index.jsx`
- When a component uses internal sub-components, place them as sibling files in the same folder (e.g., `InterfaceFormModal/index.jsx`, `InterfaceFormModal/ModeAwareFields.jsx`, `InterfaceFormModal/InterfaceForm.jsx`). The `index.jsx` remains the public entry point; sub-components are private to the folder.
- Feature isolation: each feature owns its hooks, atoms, components
- Query keys defined as constants in `helpers/queryKeys.js` per feature
- All API calls go through `fetchPost()` from `services/fetchService.js`
- Form validation with Yup schemas, forms with `FormProvider` wrapper
- Toast notifications for success/error feedback
- `PanelCard` wraps most dashboard-style content cards
