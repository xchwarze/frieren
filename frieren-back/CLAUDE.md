# Frieren API Backend

PHP micro-framework for security gadgets on OpenWrt routers/SBCs. JSON POST API with session auth + CSRF.

## Directory Structure

```
frieren-back/
├── api/
│   ├── index.php              # Entry point, custom autoloader
│   ├── config/config.php      # DeviceConfig constants (paths, URLs, flags)
│   ├── core/
│   │   ├── ApiCore.php        # Request handler, CSRF, auth, routing
│   │   ├── Controller.php     # Abstract base controller (dependencies, config, helpers)
│   │   ├── ResponseHandler.php # JSON responses + file streaming
│   │   └── Router.php         # Module loader by name → Controller class
│   ├── helper/
│   │   ├── HelperFactory.php  # Factory for OS-specific helpers
│   │   ├── HelperInterface.php # Contract for system helpers
│   │   ├── OpenWrtHelper.php  # OpenWrt impl (exec, uci, pgrep, download, password verify)
│   │   └── UciConfigHelper.php # UCI config file parser + read/write/commit
│   └── orm/
│       └── SQLite.php         # Mini ORM (query, find, insert, update, delete, each)
└── modules/
    ├── login/         # Auth (verifyPassword via /etc/shadow)
    ├── dashboard/     # System stats (ubus system board/info, CPU, memory)
    ├── header/        # Shutdown, reboot, ping
    ├── system/        # USB devices, filesystem, logs, diagnostics, init.d service control
    ├── modules/       # Module manager (install/remove/pin from remote repo)
    ├── settings/      # Hostname, timezone, password, theme
    ├── terminal/      # ttyd web terminal start/stop
    └── wireless/      # WiFi management (AP config, scan, client connect, wwan)
```

## Request Flow

1. `index.php` → autoloader → `ApiCore`
2. `ApiCore`: parse JSON body, CSRF token, session auth check
3. `Router::routeModule()` → loads `modules/{name}/{Name}Controller.php`
4. Controller constructor calls `handleActions()` → dispatches to method matching `action` param
5. Each module has `ModuleOpenWrtHelper` for OS-specific operations

## Key Patterns

- **JSON POST API** — all requests send `{module, action, ...params}`
- **Auth** — session-based + CSRF cookie. Login module bypasses auth check
- **Helpers** — `HelperFactory` creates OS-specific helpers (only OpenWrt implemented, extensible via `HelperInterface`)
- **Module helpers** — per-module `ModuleOpenWrtHelper` classes for system commands
- **Config** — UCI (OpenWrt Unified Configuration Interface) read/write via `UciConfigHelper`
- **Background ops** — `execBackground` via nohup for long-running tasks (installs, wifi, ttyd)
- **Module system** — modules discoverable via `manifest.json`, installable from remote repo, support internal/SD storage

## Core Classes

### ApiCore (`api/core/ApiCore.php`)
- `initRequest()` — parses JSON from `php://input`
- `setCSRFToken()` — manages XSRF token (cookie + session)
- `handleRequest()` — main dispatcher; checks auth, routes to module
- `authenticated()` — validates session + CSRF token
- CORS: wildcard origin, GET/POST, credentials included

### Controller (`api/core/Controller.php`)
- Abstract base for all module controllers
- `$endpointRoutes` — array of allowed action names
- `handleActions()` — routes `action` param to method
- `setupCoreHelper()` / `setupModuleHelper()` — lazy-load platform helpers
- `getModulePath()` — `/frieren/modules/{moduleName}`
- `getModuleManifest()` — reads `manifest.json`
- `checkModuleDependencies()` / `installModuleDependencies()` — opkg dependency management
- `getConfig($section)` / `setConfig($values, $section)` — UCI config read/write
- `logger($message, $level)` — syslog wrapper

### ResponseHandler (`api/core/ResponseHandler.php`)
- `setData($data, $statusCode)` — success response
- `setError($error, $statusCode)` — error response
- `dispatchResponse()` — sends JSON with CORS headers
- `streamFile($file)` — binary file download

### Router (`api/core/Router.php`)
- `routeModule()` — validates module name (`/^[a-z0-9_]+$/i`), loads controller
- Constructs: `modules/{name}/{ucfirst(Name)}Controller.php`

## Helpers

### OpenWrtHelper (`api/helper/OpenWrtHelper.php`)
All methods static:
- `exec($command)` / `execBackground($command)` — shell execution
- `checkRunning($processName)` — pgrep wrapper
- `commandExists($commandName)` — which wrapper
- `checkDependency($deps)` / `installDependency($deps)` — opkg operations
- `uciGet()` / `uciSet()` / `uciCommit()` — UCI config (delegates to UciConfigHelper)
- `uciReadConfig($name)` — full config file parse
- `downloadFile($url, $path, $flag)` — uclient-fetch background download
- `isSDAvailable()` — checks `/proc/mounts` for `/sd`
- `verifyPassword($user, $pass)` — `/etc/shadow` + crypt() + hash_equals()
- `execUbusCall($command)` — ubus JSON-RPC
- `fileGetContentsSSL($url)` — HTTPS fetch (file_get_contents or uclient-fetch)

### UciConfigHelper (`api/helper/UciConfigHelper.php`)
- `readConfig($name)` — parses `/etc/config/{name}` into array
- `uciGet($string)` / `uciSet($string, $value)` / `uciCommit()` — UCI CLI wrappers
- `uciGetJson()` / `uciSetJson()` — JSON-encoded UCI values
- Handles: config sections, options, lists, special values (TRUE/FALSE/UNSET)

### SQLite ORM (`api/orm/SQLite.php`)
- WAL mode, 5s busy timeout
- `query($sql, $params)` — SELECT → array of rows
- `exec($sql, $params)` — INSERT/UPDATE/DELETE → bool
- `find($table, $conditions)` / `findAll($table)` — convenience queries
- `insert($table, $data)` / `update($table, $data, $conditions)` / `delete($table, $conditions)`
- `count($table, $conditions)` — COUNT(*)
- `each($table, $conditions)` — generator for lazy iteration

## Modules

### Module Controller Pattern
```php
class ExampleController extends \frieren\core\Controller {
    public $endpointRoutes = ['actionOne', 'actionTwo'];
    
    public function actionOne() {
        $result = self::setupModuleHelper()::doSomething();
        $this->setSuccess($result);
    }
}
```

### Module Helper Pattern
```php
class ModuleOpenWrtHelper {
    public static function doSomething() {
        return OpenWrtHelper::exec('some-command');
    }
}
```

### Built-in Modules

| Module | Actions | Description |
|---|---|---|
| login | login, logout | Auth via /etc/shadow |
| dashboard | getSystemStats, getSystemResume, getNews | CPU, memory, uptime, board info, remote news |
| header | shutDownHardware, resetHardware, serverPing | System control |
| system | getUsbDevices, getFileSystemUsage, getSystemLogs, startDiagnosticsScript, getDiagnosticsStatus, downloadDiagnosticsFile, getServices, controlService, toggleEnabled | System monitoring + init.d service control |
| modules | getModuleList, getAvailableModules, getInstalledModules, downloadModule, downloadStatus, installModule, installStatus, checkDestination, removeModule, pinModule | Module management |
| settings | getSectionData, setHostname, setTimezone, setDatetimeFromBrowser, setUserPassword, setPanelTheme | System config |
| terminal | startTerminal, stopTerminal, getStatus | ttyd on port 1477 |
| packages | updateLists, getUpdateStatus, getInstalledPackages, getInstalledPackagesStatus, getAvailablePackages, getAvailablePackagesStatus, installPackage, getInstallStatus, removePackage, getRemoveStatus | Package management (opkg) |
| wireless | scanForNetworks, getWirelessOverview, getRadioConfig, setRadioConfig, getAssociationList, addInterface, removeInterface, toggleInterface, getInterfaceConfig, setInterfaceConfig, getRawWirelessConfig, setRawWirelessConfig, resetWirelessConfig | WiFi management |

### Module Manifest (`manifest.json`)
```json
{
    "title": "Module Name",
    "name": "module_name",
    "description": "...",
    "icon": "bootstrap-icon-name",
    "author": { "name": "DSR!", "email": "xchwarze@gmail.com" },
    "system": true,
    "forceSidebar": true,
    "version": "1.0.0",
    "order": 1
}
```

System modules: dashboard (1), system (2), wireless (3), modules (4), packages (5), settings (6), login, header, terminal. (`services` is not a module — its actions live in the `system` module.)

## Config (`api/config/config.php`)

Key constants in `DeviceConfig`:
- `GUESS_TYPE = 'OpenWrt'`
- `MODULE_ROOT_FOLDER = '/frieren/modules'`
- `MODULE_SD_ROOT_FOLDER = '/sd/modules'`
- `MODULE_SERVER_URL` — GitHub raw URL for remote module repo
- `MODULE_USE_INTERNAL_STORAGE` / `MODULE_USE_USB_STORAGE` — storage flags
- `MODULE_HIDE_SYSTEM_MODULES` — hide system modules from install list

## Module Development

Each module needs:
1. `{Name}Controller.php` — extends `\frieren\core\Controller`, defines `$endpointRoutes`
2. `ModuleOpenWrtHelper.php` — static methods for OS operations
3. `manifest.json` — metadata

Third-party modules: `frieren-modules` repo, scaffolded with `frieren-module-template/`.

## Conventions

- All helper methods are static
- Controller actions set response via `$this->setSuccess()` / `$this->setError()`
- Background operations use flag files in `/tmp/` for status polling
- Module names: lowercase alphanumeric + underscore only
- Namespace: `frieren\modules\{moduleName}`
