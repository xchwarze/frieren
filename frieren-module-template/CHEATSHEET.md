# Third-Party Module Cheatsheet

Single-file, self-sufficient reference for building a **Frieren module** (a third-party
feature, `manifest.json → "system": false`) from zero to deployed. It covers the file
layout, the build/scaffolding tooling, the backend API contract, and the frontend UI/data
patterns — everything needed to generate a module that looks and behaves like every other
one in the ecosystem.

**Scope.** Third-party modules only (things that live in `frieren-modules`/
`frieren-modules-private`, discovered by `manifest.json`). Built-in `system: true` modules
(`dashboard`, `wireless`, …) live inside `frieren-back`/`frieren-front` directly and are out
of scope.

**How to use this file.** It is meant to be read top to bottom once, then used as a lookup
table while writing code. Every pattern below is copy-paste-ready and verified against the
real source of `frieren-module-template`, `frieren-back`, and `frieren-front` (not just their
READMEs — several gotchas in §8 exist *because* the docs and the code disagree). Three deeper
specs are linked from §11 for anything this file only summarizes; you should not need to open
them to build a standard module.

---

## 1. Mental model

A module is **three things**, shipped together as one folder and deployed to
`modules/{name}/` on the device:

| Piece | File(s) | Role |
|-------|---------|------|
| Manifest | `public/manifest.json` | The loader's contract — name, title, icon, deps, version. Both backend and frontend discover the module through this file alone. |
| Backend | `public/{Ucfirst(name)}Controller.php` (+ optional `public/ModuleOpenWrtHelper.php`) | A thin PHP dispatcher: `{module, action, ...}` in, `{...}` or `{"error":...}` out. |
| Frontend | `src/entry.jsx` + `src/feature/**` | A React feature, compiled to one `dist/module.umd.js`, mounted by the host panel at runtime. |

**The one naming rule that holds everything together:** pick one lowercase
`^[a-z0-9_]+$` token — call it `{name}`. It is simultaneously:

- the module's folder name (`modules/{name}/` once deployed),
- `manifest.json`'s `"name"` field,
- `package.json`'s `"name"` field (the UMD global is built from this — see §6.1),
- the PHP namespace stem: `frieren\modules\{name}`,
- the controller class stem: `{Ucfirst(name)}Controller`,
- the `module` value every frontend request sends (`fetchPost({ module: name, action })`).

**`Ucfirst` means PHP's `ucfirst()`, not PascalCase.** It only uppercases the first
character — it does not strip underscores or capitalize after them. `Router::routeModule`
builds the controller class as `ucfirst($moduleName) . 'Controller'`, and the frontend loader
builds the UMD global the same way (`FrierenModule` + `ucfirst(name)`, §6.1). So a module named
`my_module` produces class **`My_moduleController`** (not `MyModuleController`) and global
**`FrierenModuleMy_module`** — not what a PascalCase-trained code generator would guess. Prefer
a single-word `{name}` to avoid an awkward class name; if you do use `_`, every `{Ucfirst(name)}`
placeholder in this file means literally "run `ucfirst()` on `{name}`", nothing fancier.

Get this token right once (`yarn wizard`, §3) and every other file/class name below follows
mechanically.

---

## 2. Directory anatomy

```
{name}/
├── public/                       # the backend — vite copies this into dist/ verbatim
│   ├── {Ucfirst(name)}Controller.php  # required — the API surface (extends \frieren\core\Controller)
│   ├── ModuleOpenWrtHelper.php   # optional — only if you have non-trivial OS work (§5.5)
│   ├── manifest.json             # required — the loader contract (§4)
│   ├── icon.png                  # optional — only if manifest.icon isn't a Feather glyph name
│   └── data/ · bin/              # optional — bundled data files / on-device scripts
├── src/                           # the frontend — compiled to dist/module.umd.js
│   ├── entry.jsx                  # required — default-exports the feature root (§6.2)
│   └── feature/
│       ├── atoms/                 # Jotai atoms (only if you need cross-component client state)
│       ├── components/            # {Name}Card/index.jsx per card
│       ├── containers/Screen/     # the page root the entry mounts (§6.3)
│       ├── helpers/queryKeys.js   # query-key constants, one file
│       └── hooks/                 # one use{Action}.js per backend action
├── tests-php/                     # PHPUnit — dev-only, never ships (§10.1)
├── tests-js/                      # Vitest — dev-only, never ships (§10.2)
├── bin/                           # scaffolding tools (do not hand-edit; see §3)
│   ├── wizard.js · validate.js · update-module.js · version-bump.js · manifestSchema.js
├── config/
│   ├── .env.dev · .env.prod · .env.release
├── package.json
├── vite.config.js
└── dist/                          # build output — a zip of this is what actually deploys
```

- `entry.jsx` is the **only** frontend entry point; keep it a one-liner (§6.2).
- Everything under `public/` rides into `dist/` unmodified — any file the backend needs on
  the device (a bundled binary, a data file) belongs there, not in `src/`.
- `dist/` is never hand-edited or committed — it's regenerated by `yarn build`.
- Tests live in `tests-php/`/`tests-js/`, siblings of `src/`/`public/` — not inside either one
  (§10). Neither directory is included in `dist/` or ships to the device.

---

## 3. Build workflow, step by step

```bash
# 0. one-time setup (both are sibling checkouts under frieren/)
cd frieren-module-template && yarn install

# 1. scaffold identity — prompts for title, name, description, authors, keywords, icon,
#    repository, documentation, license, guestType, dependencies, minPanelVersion (§4)
yarn wizard
#    → writes public/manifest.json (ALWAYS with forceSidebar:false, version:1.0.0 — hand-edit
#      forceSidebar to true afterwards if you want a default sidebar entry; icon then becomes
#      required, §4) and updates package.json's name+description. It does NOT reliably create
#      a working .env from config/.env.prod — see §8.

# 2. build the feature
#    Either develop it inside frieren-front under the @module alias for isolation, then move
#    it here (rename `features/{name}` -> `feature`, fix relative imports), or write directly
#    under src/feature/. Wire src/entry.jsx to render feature/containers/Screen (§6.2/§6.3).

# 3. compile
yarn build                  # vite build defaults to production mode -> config/.env.prod
                             # (there's no separate "dev build"; module.umd.js + public/ copied into dist/)
#    config/.env.prod defaults VITE_ANALYZER_ENABLE=true, which opens a bundle-analyzer HTTP
#    server that does NOT exit on its own (§8) — pass VITE_ANALYZER_ENABLE=false for an
#    unattended/CI build, or just use the release build below (analyzer off there).
yarn build --mode release   # release build — gzip-compresses dist output in place (§8)

# 4. self-check
yarn validate                # validates manifest.json against the real schema (§4)

# 5. deploy for on-device testing
#    from frieren/tools/, VITE_COMMON_ALIAS only needed if frieren-front isn't a sibling dir:
VITE_COMMON_ALIAS=/path/to/frieren-front/src \
  ./deploy.sh module {name} /path/to/{name} 192.168.7.1 root

# 6. ship
#    rename the folder to {name} if it isn't already, publish to frieren-modules(-private).

# later: bump the version (bumps package.json AND public/manifest.json together)
#   — the host cache-busts the bundle with `?v={manifest.version}`, so redeploying an update
#   without bumping the version can serve browsers a stale cached module.umd.js.
yarn version-bump patch            # or minor | major | an explicit x.y.z > current
yarn version-bump patch -p ../other-module -y   # target another dir, skip the confirm prompt

# later: re-sync config files/deps with a newer template
yarn update-module ../{name} --force --build     # -f/--force also exists as a short flag
#   default (no --force): merges dependency versions (keeps whichever side has the newer
#   semver per package) instead of overwriting package.json wholesale.
#   --no-files / --no-install skip copying template files / running yarn install.
#   CAUTION even without --force: it deletes and reinstalls the target's yarn.lock, and
#   SYNCED_FILES silently overwrites vite.config.js — including any hand-added external
#   (e.g. the @frieren/terminal-core entry from §8). --force also replaces package.json
#   wholesale except a short PRESERVED_KEYS allowlist (name/version/description/keywords/
#   author/repository/bugs/homepage) — a custom "scripts"/"license"/"engines" is NOT preserved.
```

Don't hand-roll any of `bin/*.js` — `wizard`/`validate`/`update-module`/`version-bump` are the
sanctioned way to touch `manifest.json`/`package.json`. **If `yarn wizard`/`yarn validate` die
with `Cannot find package 'yup'`, run `yarn add -D yup` first** (§8) — don't fall back to
hand-writing the manifest just because the tool is missing a dependency.

---

## 4. `manifest.json` reference

Illustrative example (field shapes are accurate; the literal values don't match any one real
manifest — `yarn wizard` always writes `forceSidebar:false`/`version:"1.0.0"`, see §3):

```json
{
  "title": "Demo Module",
  "name": "demo",
  "description": "Demo for scaffolding a new module",
  "icon": "zap",
  "authors": [{ "name": "DSR!", "email": "xchwarze@gmail.com" }],
  "keywords": ["development"],
  "repository": "https://github.com/xchwarze/frieren-modules/tree/master/demo",
  "documentation": "https://github.com/xchwarze/frieren-modules/tree/master/demo#readme",
  "license": "LGPL-3.0-or-later",
  "guestType": ["OpenWrt"],
  "dependencies": [],
  "minPanelVersion": "1.4.1",
  "system": false,
  "forceSidebar": true,
  "version": "1.0.0"
}
```

| Field | Required | Rule |
|-------|----------|------|
| `name` | yes | `^[a-z0-9_]+$`, no hyphens/spaces. Must equal folder name / namespace stem / `package.json.name`. |
| `title` | yes | Human-facing sidebar/nav label. |
| `description` | yes | One line. |
| `version` | yes | Valid semver `x.y.z`. |
| `authors` | yes | Array, ≥1 item, each `{name, email}` (email validated with yup's built-in `.email()`). |
| `keywords` | no (schema) | String array, default `[]`. **`yarn wizard` prompts for it as required anyway** — the interactive wizard is stricter than the schema for this, `icon`, and `guestType`. |
| `icon` | **conditional** | Required **only if `forceSidebar: true`**. A Feather glyph name (§6.7) or a `.png` filename that must physically exist in `public/`. |
| `repository` | yes | Source URL. |
| `documentation` | no | Docs URL; shown as a button in the panel when present. |
| `license` | no | SPDX id, e.g. `LGPL-3.0-or-later`. |
| `guestType` | no | Subset of `['OpenWrt', 'RaspberryPi']`, default `[]`. |
| `dependencies` | no | opkg/apk package names — drives the install handshake (§5.8). `[]` = no system deps. |
| `minPanelVersion` | no | Semver; panel blocks install + shows a notice if its own version is older. |
| `system` | yes | **Always `false`** for a third-party module. |
| `forceSidebar` | yes | Whether the module shows in the sidebar by default (vs. only reachable once pinned). **`yarn wizard` always writes `false`** — hand-edit to `true` for a default sidebar entry (which then makes `icon` required, per the row above). |
| `order` | no | Reserved for built-in sidebar layout — don't set it. |

**What `yarn validate` actually checks** (beyond the table above):
1. The full schema (types/required/enum) via a yup object — `strict: true`, no type coercion.
2. If `icon` ends in `.png`: the file must exist in `public/`. Otherwise it must be one of the
   212 supported Feather glyphs (§6.7) — an unknown name silently renders nothing at runtime.
3. If `forceSidebar: true` and the icon is one of the **reserved nav glyphs** (§6.7), it prints
   a non-fatal **warning** (your sidebar entry will look like a core nav item).

---

## 5. Backend — the API contract

### 5.1 Transport & response envelope

One transport for every module, no exceptions:

```
POST /api/index.php
Content-Type: application/json        ← required, or 415
{ "module": "{name}", "action": "startScan", "scanBand": "both" }
```

| Rule | Enforced by |
|------|-------------|
| `Content-Type` starts with `application/json` (prefix match; `; charset=utf-8` is fine) | `ApiCore::initRequest` → `415` otherwise |
| `module` matches `^[a-z0-9_]+$` (the router itself is case-insensitive; lowercase-only is the manifest schema's rule, not the router's) | `Router::routeModule` → throws otherwise |
| Every request except `login` needs session auth **and** CSRF | `ApiCore::authenticated` |
| No `Access-Control-*` headers, ever (same-origin only) | `ResponseHandler` |

Never invent a second transport (query string, REST path, multipart) — a new capability is
always a new `action`. Binary downloads are the one exception (`streamFile`, below).

| Outcome | Call | Wire format | Status |
|---------|------|-------------|--------|
| Success, no data | `self::setSuccess()` | `{"success": true}` | 200 |
| Success, with data | `self::setSuccess(['zones' => [...]])` | `{"zones": [...]}` — **raw object, no envelope** | 200 |
| Error | `self::setError('Invalid profile')` | `{"error": "Invalid profile"}` | 400 (default) |
| Download | `$this->responseHandler->streamFile($path)` | binary + `Content-Disposition: attachment`, then `exit` | 200 |

A mutation should return the **resulting** state (e.g. `{...getStatus()}` after a reload), not
just an echo of what was requested — the UI should never show a state that didn't actually take.

### 5.2 Controller skeleton (copy this)

```php
<?php
namespace frieren\modules\{name};

class {Ucfirst(name)}Controller extends \frieren\core\Controller
{
    protected $endpointRoutes = [
        'getStatus' => true,
        'startThing' => true,
        // list every callable action here — anything not listed is unreachable
    ];

    public function getStatus()
    {
        $data = self::setupModuleHelper()::getSomeState();
        if ($data === false) {
            return self::setError('Failed to read state.');
        }
        return self::setSuccess($data);
    }

    public function startThing()
    {
        // validate BEFORE touching the helper — see §5.4
        $target = (string)($this->request['target'] ?? '');
        if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $target)) {
            return self::setError('Invalid target value');
        }

        if (!self::setupModuleHelper()::runThing($target)) {
            return self::setError('Failed to start.');
        }
        return self::setSuccess();
    }
}
```

Rules that make this a "thin dispatcher":
- `$endpointRoutes` is an **associative allow-list** (`['action' => true]`, not `['a','b']` —
  a bare list turns keys into `0,1` and breaks routing). It **is** the module's public surface;
  `handleActions()` only calls a method whose name is `isset($endpointRoutes[$action])`.
- An action is a public method of the exact same name. No `action` → framework-supplied
  `"No action was specified"`; unknown → `"Unknown action"`.
- Read input only from `$this->request[...]` — never `$_POST`/`php://input`/`$_GET`.
- Every method ends in `self::setSuccess(...)` or `self::setError(...)`. No `echo`/`print`/
  `header()`/`exit` (downloads go through `streamFile`, which does call `exit` internally).
- System work goes through `self::setupModuleHelper()::x()` (your own `ModuleOpenWrtHelper`,
  §5.5) or `self::setupCoreHelper()::x()` (the shared `OpenWrtHelper`, §5.5). The controller
  decides *what*; the helper does *how*. Never `shell_exec`/`exec` directly in the controller.
  **`self::setupModuleHelper()` requires a companion `public/ModuleOpenWrtHelper.php`** (class
  `ModuleOpenWrtHelper` in namespace `frieren\modules\{name}`) to exist — it throws `"Helper not
  found for module: ..."` otherwise. The skeleton above assumes you added one; if you don't need
  a module-specific helper, call `\frieren\helper\OpenWrtHelper::` directly instead.
- An uncaught `\Exception` becomes `{"error": <message>}` automatically (`ApiCore::handleRequest`)
  — the message is sent **verbatim** to the client, so throw meaningful, non-sensitive text.
  (An uncaught PHP `\Error`/`\TypeError` is **not** caught this way — see the gotcha in §8.)

### 5.3 Action naming vocabulary

Stay inside this vocabulary so the surface is predictable across modules:

| Shape | Use | Examples |
|-------|-----|----------|
| `getX` | read, no side effects | `getStatus`, `getHistory` |
| `setX` / `saveX` | write one thing | `setRawConfig`, `saveZone` (empty id = create) |
| `deleteX` | remove one thing | `deleteScan` |
| `startX` / `stopX` | toggle a long-running job | `startScan`/`stopScan` |
| `applyX` | commit a composed/guarded change | `applyConfig` |
| `moduleStatus` | the module's own readiness/health snapshot | see §5.8 pattern B |
| `downloadX` | stream a file | `downloadHandshake` |

Prefer one generic CRUD quartet (`getZones/saveZone/deleteZone`) over bespoke names when
managing a typed collection.

### 5.4 Input validation — mandatory, at the controller boundary

**Every request value is hostile until validated, before it reaches a shell, a path, or a UCI
selector.** Validate in the controller, *before* calling the helper — a charset failure should
be a `400` before any system work happens.

| Technique | Use for | Example |
|-----------|---------|---------|
| `(int)` cast | ids, counts, ports, durations | `$scanID = (int)$this->request['scanID'];` |
| Charset whitelist (`preg_match`) | names, free-text fields | `'/^[a-z0-9_]+$/'` |
| Value whitelist | enums | `in_array($v, ['a','b','c'], true)` |
| `escapeshellarg` | every value that reaches a shell command | quote **each** interpolated arg individually |
| `basename()` | any value used to build a filesystem path | strips `../`, `/` |
| Fail-closed flag read | dangerous toggles | only an explicit `false`/`0`/`off` releases isolation |

**`escapeshellcmd` ≠ `escapeshellarg`.** `OpenWrtHelper::exec()` runs `escapeshellcmd($command)`
on the *whole line* by default — that does **not** make an interpolated request value safe, it
still allows arbitrary flags/arguments. If you build a command string from user input, run
`escapeshellarg()` on each interpolated value yourself, in the helper, before it's concatenated.

Known real regressions to not repeat: interpolating a MAC/BSSID into a CLI command with only a
charset check on one unrelated field (command injection); stripping only `:`→`-` from a
download filename, letting `../`/`/` survive (path traversal); relying on `escapeshellcmd`
alone and still allowing arbitrary `-o`/`--script`-style flags through. **Whitelist the
charset *and* escape the shell — neither alone is enough.**

### 5.5 System access — helpers (all static)

The controller decides; a helper executes. Two tiers:

- `self::setupModuleHelper()` → your own `ModuleOpenWrtHelper` (optional file — only add one
  when you have non-trivial OS logic; many real modules skip it and call `OpenWrtHelper`
  directly from the controller).
- `self::setupCoreHelper()` → the shared `\frieren\helper\OpenWrtHelper`. Reach for a named
  method before writing a raw `exec()` string.

`OpenWrtHelper` surface (everything below is `public static`):

| Method | Notes |
|--------|-------|
| `exec($cmd, $merge = true, $raw = false)` | Runs `escapeshellcmd($cmd)` unless `$raw = true` (use `$raw` for pipes/redirects/globs, or when args are already individually `escapeshellarg`'d). Returns a merged string, an array of lines, or **`false` on non-zero exit** — always check with `=== false`. |
| `execBackground($cmd, $redirect = '/dev/null 2>&1')` | `nohup {$cmd} > {$redirect} &`. Does **not** escape anything — escape your own args first. Prefer `BackgroundTaskHelper` (§5.6) over calling this raw. |
| `checkRunning($name, $isFullPath = false)` | `pgrep [-f]`, arg escaped internally. |
| `commandExists($name)` | `which`, arg escaped internally. |
| `checkDependency($deps[])` | Greps `/usr/lib/opkg/status`; returns `true` or `"Missing dependencies: ..."` (a string — check with `is_string()`). |
| `installDependency($deps, $installToSD = false, $taskName = ...)` | Runs the shared `packages` module's `dependency-installer.sh` via `BackgroundTaskHelper::start`. Note: this script belongs to the built-in `packages` module — a third-party module's install action implicitly depends on it. |
| `uciGet($s, $throwOnError = true)` / `uciGetJson(...)` | `'TRUE'`/`'FALSE'`/`'UNSET'` ↔ `true`/`false`/`null`. `$throwOnError = false` → `null`/`[]` instead of an exception. |
| `uciSet($s, $v, $isList = false, $autoCommit = true)` / `uciSetJson(...)` | `$autoCommit` commits just that section, not a global commit. |
| `uciCommit()` | Global `uci commit` (all pending configs). |
| `uciReadConfig($name)` | Parses `/etc/config/{name}` fully into an array (no `uci` process spawned); **throws** if the file doesn't exist. |
| `uciGetConfig($name)` / `uciGetSection($name, $section)` | Via `ubus call uci get` instead — use when you need the *real* section id (`cfgXXXXXX`) for an anonymous section, not the positional `@type[i]` alias. |
| `execUbusCall($namespace, $method, $args = [])` | Three-argument signature (not one command string) — args are JSON-encoded + escaped. Returns parsed array or `false`. |
| `downloadFile($url, $savePath, $flagPath)` | Background `uclient-fetch`, 10s timeout; touches the flag **regardless of success** — check the file exists/has content to know if it actually worked. |
| `fileGetContentsSSL($url)` | `file_get_contents` w/ 15s timeout if `openssl` loaded, else `uclient-fetch` fallback (10s). |
| `isSDAvailable()` | `strpos(file_get_contents('/proc/mounts'), ' /sd ')`. |
| `hasInternetConnection()` | `ping -c2 -W2 1.1.1.1`. |
| `verifyPassword($user, $pass)` | Reads `/etc/shadow` + `crypt()` + `hash_equals()`. |
| `logger($msg, $level = 'err')` | `logger -p user.{$level}`; invalid level silently falls back to `err`. |

### 5.6 Long-running work — `BackgroundTaskHelper`, then poll

An HTTP request must never block on a scan/install/capture. Use
`\frieren\helper\BackgroundTaskHelper` for anything that can outlive the request:

```php
// start — wipes any prior flag/log, runs `sh -c "{cmd}; touch {flag}"` in the background
BackgroundTaskHelper::start($taskName, $command);

// a getXStatus action wraps this for the frontend to poll
BackgroundTaskHelper::getStatus($taskName);   // ['completed' => bool, 'output' => string]
BackgroundTaskHelper::isRunning($taskName);   // log exists AND flag doesn't yet — use as the concurrency guard
BackgroundTaskHelper::isCompleted($taskName); // flag exists
BackgroundTaskHelper::cleanup($taskName);     // remove flag + log
```

Files: `/tmp/task-{taskName}.flag` (completion marker, touched **regardless of exit code** —
`completed: true` does not imply success, inspect `output`) + `/tmp/task-{taskName}.log`
(combined stdout+stderr). Pick a stable, unique `$taskName` per job
(e.g. `"{name}-scan"`) — it doubles as your concurrency guard via `isRunning()`.

`start()` wraps `$command` inside **double-quoted** `sh -c "{cmd}; touch {flag}"` — build
`$command` with `escapeshellarg`'d pieces (§5.4) so it doesn't itself contain an unescaped `"`
or `$`, which would break or expand inside that outer double-quoting.

A `getXStatus` polling action you write should follow the same shape the inherited
`getDependencyInstallationStatus` uses: return `{...BackgroundTaskHelper::getStatus($taskName),
'isRunning' => BackgroundTaskHelper::isRunning($taskName)}` so the frontend always gets
`completed`, `output`, and `isRunning` together.

**`BackgroundTaskHelper` has no `stop`/`kill` method** — for a `startX`/`stopX` pair (§5.3),
`stopX` kills the underlying process directly and reports the resulting state, it doesn't touch
the task's flag/log:
```php
public function stopThing()
{
    OpenWrtHelper::exec('killall -9 yourbinary');
    return self::setSuccess(['success' => !OpenWrtHelper::checkRunning('yourbinary')]);
}
```
`cleanup($taskName)` only deletes the flag/log files — it does **not** stop the process, and
calling it instead of `killall` leaves the job running while `isRunning()` falsely reports idle.

### 5.7 Persistence

| Need | Use |
|------|-----|
| Structured/queried data | `new \frieren\orm\SQLite($path, $enableExceptions = true, $performanceMode = false)` — WAL mode, 5s busy timeout; `$performanceMode` relaxes `synchronous` to `OFF` (see below) |
| Simple module settings | `$this->getConfig($section)` / `$this->setConfig($values, $section)` |
| Ephemeral run state | `/tmp` flag/lock/log (or better, `BackgroundTaskHelper`) |

`SQLite` ORM (`frieren\orm\SQLite`), all parameterized (never concatenate request values into SQL):

```php
$db = new \frieren\orm\SQLite('/path/to/db.sqlite');
$db->query($sql, $params = []);              // SELECT -> array of assoc rows
$db->exec($sql, $params = []);                // INSERT/UPDATE/DELETE -> bool
$db->find($table, $conditions, $columns = []);   // one row (assoc array) — see warning below
$db->findAll($table, $columns = []);
$db->insert($table, $data);                   // assoc array of column => value
$db->update($table, $data, $conditions);
$db->delete($table, $conditions = []);
$db->count($table, $conditions);              // int
$db->each($table, $conditions = [], $columns = []); // Generator — lazy iteration
```

**Warning: `find()` fatals on a miss, it does not return `[]`.** Its signature is declared
`: array`, but on no match it does `return $result->fetchArray(...) ?: null;` — PHP then throws
`TypeError: find(): Return value must be of type array, null returned`. Since `ApiCore` only
catches `\Exception`, not `\Throwable` (§8), that surfaces as a broken response instead of a
clean `{"error": ...}`. Don't rely on "or `[]`" — call `count($table, $conditions)` first, or
use `query($sql, $params)` and take `$rows[0] ?? null` yourself.

Only *values* are parameterized/bound above — table names, column lists, and the **keys** of
`$conditions`/`$data` are interpolated directly into the SQL string. Never build those from
request input; they must always be your own hardcoded schema names.

`getConfig`/`setConfig` (inherited from `Controller`) write a UCI file named **`fmod_{name}`**
under `/etc/config/`, in an anonymous `settings` section by default (`@settings[0]`), created
lazily on first `setConfig()` call:

```php
$this->setConfig(['scanInterval' => 60, 'enabled' => true]);   // writes fmod_{name}, one commit
$value = $this->getConfig()['scanInterval'] ?? 60;             // [] if the file doesn't exist yet
```

### 5.8 Dependency install handshake — inherit, don't reinvent

`Controller` already implements the whole flow. Declare `dependencies` in `manifest.json` and
route the three inherited actions — never call `opkg`/`apk` yourself or hand-roll polling.

**Pattern A — plain inherit (most modules).** List the three actions; implement nothing:

```php
protected $endpointRoutes = [
    'checkModuleDependencies' => true,
    'installModuleDependencies' => true,
    'getDependencyInstallationStatus' => true,
    // ...your own actions
];
```
`checkModuleDependencies` → `{hasDependencies:false, message, internalAvailable, SDAvailable}`
when something's missing, else `{hasDependencies:true}`. `installModuleDependencies` guards on
internet + not-already-installing, then backgrounds the opkg/apk install. `getDependencyInstallationStatus`
polls `BackgroundTaskHelper` and re-checks deps once `completed`.

**Pattern B — custom `moduleStatus` (when the generic opkg check isn't enough,** e.g. a
dependency satisfiable by two different package names):

```php
protected $endpointRoutes = [
    // 'checkModuleDependencies' intentionally NOT routed
    'installModuleDependencies' => true,       // keep these two inherited as-is
    'getDependencyInstallationStatus' => true,
    'moduleStatus' => true,
    // ...your own actions
];

public function moduleStatus()
{
    if (\frieren\helper\OpenWrtHelper::commandExists('yourbinary')) {
        return self::setSuccess([
            'hasDependencies' => true,
            'isRunning' => /* your own extra state */ false,
        ]);
    }
    return self::setSuccess([
        'hasDependencies' => false,
        'message' => 'yourbinary is not installed.',
        'internalAvailable' => (disk_free_space('/') > self::MIN_DISK_SPACE) && \DeviceConfig::MODULE_USE_INTERNAL_STORAGE,
        'SDAvailable' => \frieren\helper\OpenWrtHelper::isSDAvailable() && \DeviceConfig::MODULE_USE_USB_STORAGE,
    ]);
}
```
(A couple of shipped modules literally set `'message' => false` here instead of a string or
`null` — harmless on the wire, but `DependenciesAlert`'s `message` prop is typed as a string,
so it trips a dev-mode PropTypes warning. Prefer a real message or omit the key.)
The no-deps branch **must** keep the `{hasDependencies, message, internalAvailable, SDAvailable}`
shape — that's the contract the shared frontend alert relies on, regardless of which action
produced it.

**Frontend side (identical for both patterns)** — render the shared alert, never reimplement it:

```jsx
import DependenciesAlert from '@common/components/DependenciesAlert';
import { NAME_CHECK_MODULE_DEPENDENCIES } from '@module/feature/helpers/queryKeys.js'; // or your moduleStatus query key

const { hasDependencies, message, internalAvailable, SDAvailable } = statusQuery?.data ?? {};

{typeof hasDependencies === 'boolean' && !hasDependencies && (
    <DependenciesAlert
        module={'{name}'}
        dependenciesQueryKey={NAME_CHECK_MODULE_DEPENDENCIES}
        show={!hasDependencies}
        message={message}
        internalAvailable={internalAvailable}
        SDAvailable={SDAvailable}
    />
)}
```
`DependenciesAlert` internally owns the install button, background polling, log display, and
success toast + query invalidation via its own `useInstallModuleDependencies` hook — a module
never needs to call that hook itself, only render the component with these 6 props.

**`dependenciesQueryKey` must be the imported constant, never a quoted string.** It has to be
the exact same value your status query uses inside `queryKey: [...]`, because
`useInstallModuleDependencies` invalidates `[dependenciesQueryKey]` on a successful install —
pass a mismatched literal and the install works but the alert never goes away. Real modules
do this: `dependenciesQueryKey={HCXDUMPTOOL_GET_MODULE_STATUS}`.

**Gotcha:** the install task name (`Controller::TASK_DEPENDENCIES = 'fm-dependencies'`) is a
**global constant shared by every module in the system**, not per-module. If module A is
mid-install, module B's install click fails with `"Installation in progress"` even though the
two are unrelated — this is inherited framework behaviour, not something a module can fix.

### 5.9 Security — non-negotiables

1. **Auth + CSRF on every action** except `login` — handled entirely by `ApiCore`; never add a
   bypass.
2. **No CORS** — same-origin only. Never add `Access-Control-*` headers to "fix" a cross-origin
   call; proxy it server-side instead.
3. **Injection** — whitelist charset *and* `escapeshellarg` every shell arg; parameterize every
   SQL query; `basename()` every path built from input (§5.4).
4. **Fail-closed** — a dangerous toggle stays engaged unless an explicit falsey value releases it.
5. **Boundary integrity** — write only the UCI/config file your module owns
   (`fmod_{name}`, or one you explicitly document); never touch another module's or a core
   config file (`/etc/config/network`, `/etc/config/wireless`, …).
6. **Least privilege for side processes** — any helper/broadcaster process your module launches
   opens data read-only when it only reads, and binds loopback-only if it exposes a socket.

---

## 6. Frontend — building the UI module

### 6.1 `vite.config.js` — what's already wired for you

Don't edit the aliasing/externalization logic; know what it does:

| Alias | Resolves to | Use for |
|-------|-------------|---------|
| `@module` | this module's own `./src` | your own code |
| `@src` / `@common` | the host's `frieren-front/src` (via `VITE_COMMON_ALIAS`, default `../frieren-front/src`) | shared components/hooks/services — **both aliases resolve to the identical path**, pick either. This file uses `@common` (the template's own example code does too); most shipped modules in `frieren-modules` use `@src` instead — you'll see both in the wild, and neither is wrong. |

**Externals** — these packages are *never* bundled into your `module.umd.js`; they resolve at
runtime from `window.Frieren.*` (set up once by the host in `umdSupport.js` before it renders):
`react`, `react-dom`, `react/jsx-runtime`, `react-bootstrap` (and any `react-bootstrap/X`
subpath — resolved dynamically to `Frieren.ReactBootstrap.X`), `jotai`, `jotai/utils`,
`prop-types`, `react-content-loader`, `react-hook-form`, `@hookform/resolvers`,
`@hookform/resolvers/yup`, `react-toastify`, `wouter`, `yup`, `@tanstack/react-query`. Import
them normally (`import { useAtom } from 'jotai'`) — Vite/Rollup swaps the import for the global
at build time. **Don't import any of these as a real dependency** (they'd bloat the bundle and
likely double-load React).

**UMD name.** The global the host looks for is `FrierenModule` + `ucfirst(package.json.name)`
(override the source with `VITE_LIB_NAME`, undocumented but real) — so `package.json.name` and
`manifest.json.name` **must be the same token**, or the panel will fail to find your export.

**Env files** live in `config/.env.{dev,prod,release}` (not the project root), loaded by Vite
mode (`development`→`dev`, `production`→`prod`, any other `--mode X`→`X` literally). Every flag
can be overridden inline on the build command (`VITE_X=... yarn build --mode release`).

### 6.2 `src/entry.jsx`

```jsx
import Screen from './feature/containers/Screen';

const Loader = () => <Screen />;

export default Loader;
```
This is invoked by the host as `window.FrierenModule{Ucfirst(name)}()` — a zero-argument function
returning JSX, not a component the host renders with `<Loader/>` — keep it exactly this shape.

### 6.3 `src/feature/` convention

```
feature/
├── atoms/{name}Atoms.js         # only if you need cross-component client state (e.g. isRunningAtom)
├── components/{Name}Card/index.jsx
├── containers/Screen/index.jsx  # the page root — always named "Screen" (every shipped module
│                                 #   but the bundled `demo` uses this name; don't copy `demo`'s
│                                 #   legacy `Demo/` folder name, §7)
├── helpers/queryKeys.js         # // format: FEATURE_ACTION
└── hooks/use{Action}.js         # one hook per backend action
```

`helpers/queryKeys.js` — one constant per backend action, `SCREAMING_SNAKE_CASE` name /
`kebab-case` value:
```js
// format: FEATURE_ACTION
export const {NAME}_GET_STATUS = '{name}-get-status';
```

### 6.4 Making API requests

Never call `fetch` directly — always through `fetchPost` wrapped in the authenticated
query/mutation hooks (they auto-handle session/CSRF errors: clear auth, redirect to login,
toast):

```jsx
// hooks/useGetStatus.js
import useAuthenticatedQuery from '@common/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@common/services/fetchService.js';
import { NAME_GET_STATUS } from '@module/feature/helpers/queryKeys.js';

const useGetStatus = () => useAuthenticatedQuery({
    queryKey: [NAME_GET_STATUS],
    queryFn: () => fetchPost({ module: '{name}', action: 'getStatus' }),
});

export default useGetStatus;
```

```jsx
// hooks/useStartThing.js
import { useQueryClient } from '@tanstack/react-query';
import useAuthenticatedMutation from '@common/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@common/services/fetchService.js';
import { NAME_GET_STATUS } from '@module/feature/helpers/queryKeys.js';

const useStartThing = () => {
    const queryClient = useQueryClient();
    return useAuthenticatedMutation({
        mutationFn: ({ target }) => fetchPost({ module: '{name}', action: 'startThing', target }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [NAME_GET_STATUS] }),
    });
};

export default useStartThing;
```

`fetchPost(data)` posts to `{origin}/{VITE_RELATIVE_API_PATH}` (default `api/index.php`) with
`credentials: 'include'` and auto-attaches the `X-XSRF-TOKEN` header from the `XSRF-TOKEN`
cookie — there is no CSRF plumbing for a module to write.

**The host's React Query client applies to your queries too:** `staleTime: 10 min` /
`gcTime: 15 min` by default (`services/queryClient.js`). A `useGetStatus` card won't refetch on
remount inside that window unless you pass your own `staleTime`/`refetchInterval` in the hook,
or the query key changes. `useBackgroundTask` (below) already opts out with `staleTime: 0` so
its polling isn't blocked by this.

For a long-running job with its own polling status action, use `useBackgroundTask` (contract:
your status action must return `{ completed: boolean, ...payload }`):
```jsx
import useBackgroundTask from '@common/hooks/useBackgroundTask.js';

const status = useBackgroundTask({
    queryKey: NAME_GET_SCAN_STATUS,
    module: '{name}',
    action: 'getScanStatus',
    onCompleted: (data) => { /* toast, invalidate, etc. */ },
});
status.start();     // call after the startX mutation succeeds
status.isRunning;
```
`useBackgroundTask` also gives up after a default 1-hour `timeout` (toasts "Task timed out" and
stops polling) — pass your own `timeout` for a job you expect to run longer.

### 6.5 State — Jotai atoms

```js
// feature/atoms/{name}Atoms.js
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const isRunningAtom = atom(false);                     // ephemeral, per-session
export const someSettingAtom = atomWithStorage('{name}-setting', '');  // persisted across reloads
```
Use a plain `atom()` for transient UI/process state (e.g. "is a capture running right now"),
`atomWithStorage` only for things that should survive a page reload.

### 6.6 Shared UI components — use these, never raw react-bootstrap

All imported from `@common/components/...`. **Never import a raw react-bootstrap primitive that
has a shared wrapper below** (`Button`, `Card`→`PanelCard`, `Table`→`PanelTable`,
`Tabs`→`PanelTabs`, `Pagination`→`TablePagination`, `Badge`→`StatusBadge` for semantic
status words only, `Modal`→`ConfirmationModal` for confirm dialogs) — the wrapper carries
a11y/spacing rules the primitive lacks. **`Tab` (singular, the individual tab item) is the one
exception that's always imported raw** — `PanelTabs` requires real react-bootstrap `<Tab>`
children to introspect the nav, so both `renderPanelTab` internally and any hand-composed tab
layout (see the tabbed-screen example above) `import Tab from 'react-bootstrap/Tab'` — note
`ui-layout.spec.md` §2 still lists `Tab` as banned; this file's carve-out is the accurate one
(`PanelTabs` itself needs real `<Tab>` children). **Everything
else is fine to import raw** too — real modules do it constantly: `Row`, `Col`, `Form`,
`Accordion`, `InputGroup`, `Alert`, `Spinner`, a bespoke `Modal`, a generic-color `Badge`.
There's no shared wrapper for those, and none is needed.

| Component | Import path | Use for |
|-----------|-------------|---------|
| `PanelCard` | `components/PanelCard` | Every content card. Owns the header→content gap + padding — never add `mt-*` to your first child. **`showRefresh` defaults to `true`** — pass `showRefresh={false}` on a static card with no `refetch`, or it ships an enabled Refresh button that does nothing. |
| `PanelStack` | `components/PanelCard/PanelStack` | Vertical stack of cards — the only place card-to-card spacing lives. |
| `PanelTable` | `components/PanelTable` | Every table (never a raw `<Table>`). Always render an empty-state row. |
| `DependenciesAlert` | `components/DependenciesAlert` | The dependency-install UI (§5.8) — never reimplement. |
| `Button` | `components/Button` | Every button. Derives `aria-label` from `label`→`title`→`icon`; icon-only buttons need a `title`/`label`. |
| `Icon` | `components/Icon` | `<Icon name={'shield'} />`. **Never pass `className` to it** — it overwrites the glyph class and the icon silently disappears; wrap it in a `<span className='me-2'>` for spacing instead. |
| `FormActions` | `components/FormActions` | Right-aligned submit/cancel footer row. |
| `ActionButtons` | `components/ActionButtons` | Icon-only button cluster (table row actions). |
| `PanelTabs` + `renderPanelTab` | `components/Tabs/PanelTabs` | URL-driven tabs (`#/{name}/{tab}`) — see example below and §6.7. |
| `Form/*` | `components/Form/{FormProvider,InputField,SelectField,SwitchField,CheckboxField,TextAreaField,SubmitButton}` | The form system (§6.7). |

Minimal card:
```jsx
import PanelCard from '@common/components/PanelCard';

<PanelCard title={'Status'} icon={'activity'} refetch={query.refetch} isFetching={query.isFetching}>
    {/* content — no mt-* on the first child, PanelCard owns that gap */}
</PanelCard>
```

Minimal form:
```jsx
import * as yup from 'yup';
import FormProvider from '@common/components/Form/FormProvider';
import InputField from '@common/components/Form/InputField';
import SwitchField from '@common/components/Form/SwitchField';
import SubmitButton from '@common/components/Form/SubmitButton';

const schema = yup.object({ name: yup.string().required('Name is required') });

<FormProvider schema={schema} defaultValues={{ name: '', enabled: false }} onSubmit={mutation.mutateAsync}>
    <InputField name={'name'} label={'Name'} />
    <SwitchField name={'enabled'} label={'Enable'} />
    <SubmitButton label={'Save'} />
</FormProvider>
```
`onSubmit` must return a Promise (`mutation.mutateAsync`, not `mutation.mutate`) — the submit
button's loading state depends on it settling. `FormProvider` actually calls
`onSubmit(values, methods)` — the second arg is the `react-hook-form` instance, handy for
`methods.reset()` after a successful save (e.g. `onSubmit={(values, methods) =>
mutation.mutateAsync(values).then(() => methods.reset())}`).

Tabbed screen — the host already routes every external module at `/{name}/:tab?`
(`LoginStack.jsx`); **a module never adds its own `<Route>`**, it only renders the tabs:
```jsx
import PanelTabs, { renderPanelTab } from '@common/components/Tabs/PanelTabs';

const TABS = [
    { key: 'capture', title: 'Capture', icon: 'activity', content: <CaptureCard /> },
    { key: 'history', title: 'History', icon: 'file-text', content: <HistoryCard /> }, // count: N is optional, a trailing badge
];

<PanelTabs id={'{name}'} defaultTab={'capture'}>
    {TABS.map((tab) => renderPanelTab('{name}', tab))}
</PanelTabs>
```
Each config entry is `{key, title, icon, content}` plus optional `count` (trailing badge) and
`gap` (adds a top margin only when content sits flush against the tab nav — leave it off for
a `PanelCard`/table, which already owns its own spacing). `renderPanelTab(id, tab)` just builds
`<Tab eventKey title={<TabTitle/>}><ConditionalTabContent>{content}</ConditionalTabContent></Tab>`
for you — several shipped modules (`hcxdumptool`, `nmap`) instead compose `Tab`/`TabTitle`/
`ConditionalTabContent` by hand for the exact same result; either is fine, `renderPanelTab` is
just less to type.

### 6.7 Spacing & icons — quick rules

Full rationale lives in `ui-layout.spec.md`; the load-bearing rules:

- Never hand-tune spacing with `mt-*`/`mb-5`/inline `style={{margin}}` — every gap is owned by
  a shared component (`PanelCard`, `PanelStack`, `FormActions`, form field components).
- Group action buttons in `<ActionButtons>` (icon-only, table rows) or `d-flex flex-wrap gap-2`
  (labeled toolbar — `flex-wrap` keeps it from overflowing on mobile) — never `ms-2` per button.
- Heavy forms → group fields in a react-bootstrap `<Accordion alwaysOpen>`, one item per
  concern — never nest tabs inside tabs.
- Tabbed sections are URL-driven via `PanelTabs` + `renderPanelTab` (see the example in §6.6) —
  the host already supplies the `/:tab?` route, a module never adds one itself.
- Rows are keyed by a stable id, never `key={index}`.
- Use `text-body-secondary`, not the deprecated `text-muted`.

**Icons** — one Feather icon font, 212 glyphs, rendered via `<Icon name={'...'}/>`. Every
`manifest.icon`, `PanelCard` `icon`, `Accordion.Header`, tab entry, and `Button` `icon` should
carry one. **Reserved — do not use for a manifest icon or a card/tab title** (these collide
with core nav):

```
trello (dashboard) · grid (modules) · package (packages) · settings (settings) · cpu (system)
radio (wireless) · share-2 (network) · menu / sidebar (nav toggles) · power (shutdown/reboot)
refresh-cw (reserved for PanelCard's refresh button)
```

Full glyph set (verify a name is in this list before using it — a missing glyph renders
nothing, and there is no `shield-check`/`shield-lock`/`list`; use `shield` / `menu` instead):

```
activity alert-circle alert-octagon alert-triangle aperture archive arrow-down arrow-down-circle
arrow-down-left arrow-down-right arrow-left arrow-left-circle arrow-right arrow-right-circle
arrow-up arrow-up-circle arrow-up-left arrow-up-right at-sign bar-chart bar-chart-2 bell bell-off
bluetooth bookmark box briefcase calendar camera cast check check-circle check-square
chevron-down chevron-left chevron-right chevron-up chevrons-down chevrons-left chevrons-right
chevrons-up chrome circle clipboard clock cloud cloud-drizzle cloud-lightning cloud-off
cloud-rain cloud-snow code coffee columns command compass copy corner-down-left
corner-down-right corner-left-down corner-left-up corner-right-down corner-right-up
corner-up-left corner-up-right cpu crop crosshair database delete disc download
download-cloud droplet edit edit-2 edit-3 external-link eye eye-off fast-forward file
file-minus file-plus file-text filter flag folder folder-minus folder-plus github globe grid
hard-drive hash heart help-circle home image inbox info key layers layout life-buoy link
link-2 loader lock log-in log-out mail map-pin maximize maximize-2 menu message-circle
message-square minimize minimize-2 minus minus-circle minus-square monitor moon
more-horizontal more-vertical mouse-pointer move navigation navigation-2 package paperclip
pause pause-circle percent pie-chart play play-circle plus plus-circle plus-square pocket
power printer radio refresh-ccw refresh-cw repeat rewind rotate-ccw rotate-cw rss save
scissors search send server settings share share-2 shield shield-off shuffle sidebar
skip-back skip-forward slash sliders smartphone speaker square star stop-circle sun tag
target terminal thermometer thumbs-down thumbs-up toggle-left toggle-right tool trash
trash-2 trello trending-down trending-up triangle unlock upload upload-cloud user
user-check user-minus user-plus user-x users video video-off wifi wifi-off wind x
x-circle x-octagon x-square zap zap-off zoom-in zoom-out
```

---

## 7. Reference: real modules by pattern

| Module | Illustrates |
|--------|-------------|
| `demo` (in `frieren-module-template`/`frieren-modules`) | The bare scaffold — one backend action (`getSystemStats`) exercised by three small cards, no dependencies. Start here to see the minimum shape end to end. Its container folder is named `Demo/`, not `Screen/` — a legacy naming exception in the bundled demo itself; use `Screen` for a new module (§6.3). |
| `wpaonlinecrack` | Dependency install, Pattern A (plain inherited `checkModuleDependencies`). |
| `tcpdump`, `hcxdumptool` | Dependency install, Pattern B (custom `moduleStatus`, needed because the dependency is satisfiable by two different package names). |
| `nmap` | Also Pattern B (`moduleStatus`), without the two-package-names rationale — shows the pattern isn't limited to that one reason. |
| `usbstorage` | A `ModuleOpenWrtHelper` with snapshot/rollback around a shared system config file (`/etc/config/fstab`). |
| `tcpdump`, `nmap`, `hcxdumptool` | Built-in "presets" pattern (`helpers/presets.js` + backend-persisted custom presets in a JSON file inside the module folder). |
| `wigle` | Cursor-based pagination ("Load More") instead of `TablePagination`, for an API paged by a token. |

---

## 8. Known gotchas (verified against source, not assumptions)

- **`VITE_SOURCEMAP` has no effect in this template.** The `.env.*` files (and older docs) use
  `VITE_SOURCEMAP`, but `vite.config.js` actually reads `VITE_SOURCEMAP_ENABLE`. To get
  sourcemaps, set `VITE_SOURCEMAP_ENABLE=true` (inline or edit the code) — the documented
  variable name is currently dead.
- **`yup` is undeclared *and currently unresolvable* — `yarn wizard`/`yarn validate` fail out of
  the box.** `bin/manifestSchema.js` and `bin/validate.js` do `import * as yup from 'yup'`, but
  `yup` is listed only as a `peerDependency` (never installed by `yarn install`) and — unlike
  `semver` below — nothing else hoists a copy into `node_modules`. Verified: a fresh `yarn
  install` then `node ./bin/validate.js` throws `ERR_MODULE_NOT_FOUND: Cannot find package
  'yup'`, and the same happens for `yarn wizard`. **Workaround: `yarn add -D yup` once**, in the
  module directory, before using either tool.
- **`semver` is also an undeclared dependency, but currently harmless.** `bin/manifestSchema.js`,
  `bin/update-module.js`, and `bin/version-bump.js` import it directly too, but it's not in
  `package.json` either — it happens to still resolve because it's hoisted transitively via
  other deps. Less urgent than the `yup` problem above, but the same future dependency-bump risk
  applies: it could start throwing "Cannot find module 'semver'" with no warning.
- **`yarn wizard`'s `.env` bootstrap is a no-op.** It looks for `.env`/`.env.prod` at the
  project root, but the real env files live in `config/` (`vite.config.js` loads
  `${cwd}/config`) — so it never actually copies anything, and a root `.env` wouldn't be read
  by the build even if it existed. Ignore that step; edit `config/.env.{dev,prod,release}`
  directly (§6.1) or pass flags inline on the build command.
- **A default `yarn build` opens a bundle-analyzer server that never exits.**
  `config/.env.prod` ships `VITE_ANALYZER_ENABLE=true`; the analyzer plugin's default mode is
  `"server"`, which starts an HTTP server and blocks — an unattended build hangs. Use
  `yarn build --mode release` (analyzer off by default) or set `VITE_ANALYZER_ENABLE=false`
  for a scripted/CI build.
- **`HelperInterface.php` is aspirational, not authoritative.** `OpenWrtHelper` doesn't actually
  `implements` it, and has several real methods missing from the interface (`commandExists`,
  `uciReadConfig`, `uciGetJson`, `uciSetJson`, `uciGetConfig`, `uciGetSection`,
  `hasInternetConnection`, `logger`). Trust the table in §5.5, not the interface file.
- **Release builds gzip `module.umd.js` in place, same filename.** `yarn build --mode release`
  with compression enabled overwrites `dist/module.umd.js` with its own gzip'd bytes (no `.gz`
  suffix) — opening it expecting plain JS will look corrupted. That's expected; the device's
  web server is assumed to serve pre-compressed assets.
- **The dependency-install task name is a global mutex, not per-module.** `Controller::TASK_DEPENDENCIES`
  is the same string (`'fm-dependencies'`) for every module — two modules can't install deps at
  the same time, even though they're unrelated (§5.8).
- **A module's install handshake implicitly depends on the built-in `packages` module.**
  `installDependency()` shells out to `{MODULE_ROOT_FOLDER}/packages/bin/dependency-installer.sh`
  unconditionally — this is always present on a real device, but matters if you're ever testing
  against a partial/stripped install.
- **`ApiCore` only catches `\Exception`, not `\Throwable`.** An uncaught PHP `\TypeError`/`\Error`
  in your controller will *not* turn into a clean `{"error": ...}` JSON response — write
  defensively (validate types, don't rely on the framework's catch-all for programmer errors).
- **`execUbusCall` takes 3 arguments** — `($namespace, $method, $args = [])` — not a single
  command string; some older docs simplify this incorrectly.
- **`@frieren/terminal-core` is not in this template's UMD externals/globals map**, even though
  the host exposes it as `window.Frieren.TerminalCore`. A module embedding the terminal must add
  that entry to `vite.config.js`'s `EXTERNAL_DEPS`/`GLOBALS_MAP` itself.
- **`package.json.name` and `manifest.json.name` drifting apart breaks the UMD load** (§6.1) —
  the wizard keeps them in sync automatically; don't hand-edit one without the other. Also
  note `react-dom` maps to `Frieren.ReactDOM`, which the host publishes from `react-dom/client`
  (`createRoot`) — if you import plain `react-dom` expecting the legacy `render` API, it won't
  be there.
- **Vite library mode inlines every imported asset as base64**, ignoring `assetsInlineLimit`. A
  shared component's image asset gets base64'd into *every* module that imports it — keep your
  own images small, and if you add a new shared component with an asset, expose it via
  `window.Frieren.*` instead of a normal `import` (mirrors how `loadingImage` is handled).

---

## 9. Master checklist

- [ ] One `{name}` token everywhere: folder, `manifest.name`, `package.json.name`, namespace
      `frieren\modules\{name}`, `{Ucfirst(name)}Controller` (PHP `ucfirst`, not PascalCase — §1).
- [ ] `manifest.json` complete and passes `yarn validate` (icon rule, authors, semver, etc.).
- [ ] Controller extends `\frieren\core\Controller`; `$endpointRoutes` is an associative
      allow-list listing exactly the public actions.
- [ ] Every request value is validated (charset/whitelist/`(int)`/`basename()`) before it
      reaches a helper; every shell arg is `escapeshellarg`'d individually.
- [ ] System work lives in a static helper, not inline `exec()` in the controller.
- [ ] Long jobs run via `BackgroundTaskHelper` + a polling `getXStatus` action — the request
      never blocks; `isRunning()` is the concurrency guard.
- [ ] If there are system deps: declared in `manifest.json`; the three inherited actions routed
      (Pattern A) or a `moduleStatus` keeping the `{hasDependencies,...}` shape (Pattern B);
      `<DependenciesAlert>` rendered client-side, never reimplemented.
- [ ] `entry.jsx` default-exports a zero-arg component rendering `feature/containers/Screen`.
- [ ] Shared imports come from `@common`, own code from `@module` — no raw `react-bootstrap`
      imports, no forked copies of `PanelCard`/`DependenciesAlert`/etc.
- [ ] Every card uses `PanelCard` (+ `PanelStack` for stacking), every table `PanelTable` with
      an empty-state row, every icon name checked against §6.7's list (not a reserved one).
- [ ] All API calls go through `fetchPost` via `useAuthenticatedQuery`/`useAuthenticatedMutation`
      — no raw `fetch`.
- [ ] Built with `yarn build`, validated with `yarn validate`, deployed via `tools/deploy.sh module`.
- [ ] No new transport, no CORS, no auth/CSRF bypass, no writes outside the module's own
      `fmod_{name}` UCI config.
- [ ] Backend: `composer test` green (PHPUnit + `php-mock` mocking the OS boundary, §10.1).
      Frontend: `yarn test` green (Vitest, `@common` mocked in `vitest.setup.jsx`, §10.2).

---

## 10. Testing (PHPUnit + Vitest)

Two independent, dev-only test setups — neither ships to the device, neither is required to
build/deploy a module. Both are already wired up in this template as a working reference;
copy them into your own module the same way you copy everything else here.

### 10.1 Backend — PHPUnit

```bash
composer install   # one-time: phpunit/phpunit + php-mock/php-mock-phpunit into vendor/ (gitignored)
composer test       # or: vendor/bin/phpunit
```

`composer.json` (test-only — production PHP is still loaded by the host's own autoloader
on-device; nothing here ships):
```json
{
  "name": "frieren/{name}",
  "require": { "php": ">=8.1" },
  "repositories": [{ "type": "path", "url": "../frieren-back" }],
  "require-dev": {
    "frieren/back": "*",
    "phpunit/phpunit": "^11.0",
    "php-mock/php-mock-phpunit": "^2.10"
  },
  "autoload-dev": {
    "psr-4": {
      "frieren\\modules\\{name}\\": "public/",
      "frieren\\modules\\{name}\\Tests\\": "tests-php/"
    }
  },
  "minimum-stability": "dev",
  "prefer-stable": true,
  "scripts": { "test": "phpunit --colors=always" }
}
```
- The `path` repository **symlinks** `../frieren-back` in as a real dependency (`frieren/back`)
  — `\frieren\core\Controller`, `\frieren\helper\OpenWrtHelper`, etc. resolve to the actual
  framework classes, not a copy. Requires `frieren-back` to be a sibling checkout (same
  assumption as `VITE_COMMON_ALIAS`, §6.1).
- `minimum-stability: dev` + `prefer-stable: true` is required — a path-repo package with no
  version tag resolves as `dev-master`, which Composer rejects otherwise.

**Dispatching a real Controller in a test.** `Controller::__construct()` auto-dispatches the
action immediately; the public `getResponseHandler()` (§5.2 skeleton doesn't show it, but every
`Controller` has one) hands back the `ResponseHandler` instance — but *that* class has no
public getter for its `data`/`error`, and its own `dispatchResponse()` calls `exit()`, so it
can't be invoked in a test process either. Copy this trait once per module (~30 lines, not
worth sharing across repos — kept in sync with `frieren-back`'s own copy at
`tests-php/Support/DispatchesControllers.php`):
```php
namespace frieren\modules\{name}\Tests\Support;

trait DispatchesControllers
{
    protected function dispatch(string $controllerClass, string $moduleName, array $request): array
    {
        $controller = new $controllerClass($request, $moduleName);
        $responseHandler = $controller->getResponseHandler();
        $reflection = new \ReflectionClass($responseHandler);
        $read = function (string $property) use ($reflection, $responseHandler) {
            $prop = $reflection->getProperty($property);
            $prop->setAccessible(true);
            return $prop->getValue($responseHandler);
        };
        return ['data' => $read('data'), 'error' => $read('error'), 'statusCode' => $read('statusCode')];
    }
}
```
```php
use frieren\modules\{name}\Tests\Support\DispatchesControllers;

class DemoControllerTest extends \PHPUnit\Framework\TestCase
{
    use \phpmock\phpunit\PHPMock;
    use DispatchesControllers;

    public function testGetSystemStats(): void
    {
        // execUbusCall() -> OpenWrtHelper::exec() -> the raw exec() inside `frieren\helper`.
        $exec = $this->getFunctionMock('frieren\helper', 'exec');
        $exec->expects($this->once())->willReturnCallback(function ($cmd, &$output = null, &$retval = null) {
            $output = [json_encode([
                'load' => [65536, 0, 0],
                'memory' => ['total' => 1000, 'free' => 500, 'buffered' => 0, 'cached' => 0],
                'swap' => ['total' => 200, 'free' => 100],
                'uptime' => 120, 'localtime' => 1700000000,
            ])]; // one element = implode() reconstructs it whole
            $retval = 0;
        });

        // ModuleOpenWrtHelper also calls file('/proc/stat') unqualified — but that resolves
        // in *this module's own* namespace, not frieren\helper, so it needs its own mock.
        $procStat = $this->getFunctionMock('frieren\modules\{name}', 'file');
        $procStat->expects($this->once())->willReturn(["cpu 0 0 0 0\n", "cpu0 0 0 0 0\n"]);

        $result = $this->dispatch(DemoController::class, '{name}', ['action' => 'getSystemStats']);

        $this->assertNull($result['error']);
        $this->assertSame('100%', $result['data']['cpu_usage']); // 1.0 load / 1 core
    }
}
```
**Mocking technique (`php-mock/php-mock-phpunit`).** `OpenWrtHelper`/`UciConfigHelper` call the
*global* `exec()`/`file()`/`file_exists()`/`file_get_contents()` unqualified, inside
`namespace frieren\helper` — PHP resolves an unqualified function call against the current
namespace first, so mocking that one namespace intercepts every helper method built on it
(all of §5.5's surface, from one mock). If your **own** `ModuleOpenWrtHelper` calls a global
function directly (not through `OpenWrtHelper`), mock it in *your own* module's namespace
instead, as the `file('/proc/stat')` mock above does — see `tests-php/ModuleOpenWrtHelperTest.php`
in this template for the same pattern isolated to just the Helper (no Controller dispatch).

**What doesn't need mocking:** pure logic (parsing, math, formatting —
`ModuleOpenWrtHelper::secondsToUptime()` needs zero mocks) and anything with a real,
host-testable backend (`\frieren\orm\SQLite` against `:memory:`, §5.7). Mock only the actual
OS boundary — see `tests-php/ModuleOpenWrtHelperTest.php` and `tests-php/DemoControllerTest.php` for
the two patterns side by side.

### 10.2 Frontend — Vitest

```bash
yarn test         # vitest run --passWithNoTests
yarn test:watch   # vitest, watch mode
```

`vitest.config.js` (adapted from `frieren-modules-private/evilportal`'s):
```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const COMMON_ALIAS = process.env.VITE_COMMON_ALIAS || '../frieren-front/src';

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom', 'react-bootstrap'],
        alias: {
            '@module': path.resolve(__dirname, './src'),
            '@src': path.resolve(__dirname, COMMON_ALIAS),
            '@common': path.resolve(__dirname, COMMON_ALIAS),
        },
        extensions: ['.js', '.jsx', '.json'],
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.jsx'],
        include: ['tests-js/**/*.test.{js,jsx}'],
    },
});
```
`@src`/`@common` point at the **real** `VITE_COMMON_ALIAS` (same as production, §6.1) — not a
mock-only folder — so any `@common` import you didn't explicitly mock still resolves for real
instead of failing to resolve.

`vitest.setup.jsx` mocks the handful of `@common` components a scaffolded module is most
likely to render (`PanelCard`, `Button`, `FormActions`, `SkeletonBar`), so a component test
doesn't need a real `frieren-front` checkout for the common case. **There is no monolithic
`@common/components/Form`** — the form system is individual subpath imports only
(`@common/components/Form/{FormProvider,InputField,SwitchField,...}`, §6.6); don't mock a
`Form` default export, mock (or use the real) individual field components you actually render:
```jsx
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

vi.mock('@common/components/PanelCard', () => {
    const PanelCard = ({ title, children, refetch, isFetching, ...props }) => (
        <div {...props} data-testid="panel-card">
            {title && <h5 className="card-title">{title}</h5>}
            {children}
        </div>
    );
    return { default: PanelCard };
});
// one vi.mock per @common component your tests render — see vitest.setup.jsx for the full set
// this template ships (PanelCard, Button, FormActions, SkeletonBar).
```

Component test — `tests-js/StateDemoCard.test.jsx` (tests live outside `src/`, mirroring
`tests-php/`) renders the *real* component (only its
two `@common` imports, `PanelCard`/`Button`, are mocked) and exercises real jotai atoms +
`wouter`'s `useLocation()`, no provider needed:
```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StateDemoCard from '@module/feature/components/StateDemoCard';

it('increments the plain jotai counter atom on click', async () => {
    render(<StateDemoCard />);
    await userEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
});
```

Plain-logic test — no rendering; `.js` works too, not just `.jsx` (the `include` glob covers
both, on purpose — a pure-logic test shouldn't need a `.jsx` filename):
```js
// tests-js/queryKeys.test.js
import { DEMO_GET_SYSTEM_STATS } from '@module/feature/helpers/queryKeys.js';

it('follows the FEATURE_ACTION kebab-case convention', () => {
    expect(DEMO_GET_SYSTEM_STATS).toBe('demo-get-system-stats');
});
```

**`peerDependencies` also need to be `devDependencies` for tests to actually run.** They're
`peerDependencies` so the production UMD build externalizes them (§6.1) — but Vitest
*executes* your component code for real, so **all 12** — `react`, `react-dom`, `jotai`,
`wouter`, `react-bootstrap`, `bootstrap`, `react-hook-form`, `react-toastify`,
`@hookform/resolvers`, `@tanstack/react-query`, `prop-types`, `yup` — need to be real,
installed packages for the test run to work. List every one of them in **both** blocks (see
this template's own `package.json`) — `peerDependencies` alone installs nothing via
`yarn install`.

```json
{
  "scripts": { "test": "vitest run --passWithNoTests", "test:watch": "vitest" },
  "devDependencies": {
    "vitest": "^4.1.10", "jsdom": "^29.1.1",
    "@testing-library/react": "^16.3.2", "@testing-library/jest-dom": "^7.0.0",
    "@testing-library/dom": "^10.4.1", "@testing-library/user-event": "^14.6.1"
  }
}
```

---

## 11. Where to dig deeper

This cheatsheet summarizes and cross-checks the three specs below against real source. Open
one only when you need more nuance than what's here:

| Spec | Owns |
|------|------|
| `frieren/specs/module-template.spec.md` | Packaging/lifecycle detail: manifest field-by-field rationale, build isolation internals, the full dependency-handshake sequence diagram. |
| `frieren/specs/api-design.spec.md` | Backend contract in full depth: every action-naming nuance, guarded/destructive mutations, error handling philosophy. |
| `frieren/specs/ui-layout.spec.md` | Frontend spacing/layout rationale in full: exact pixel values and *why*, equal-height card patterns, accessible button rules. |

Also useful: `frieren-module-template/README.md` (the original getting-started walkthrough this
cheatsheet supersedes for day-to-day use), `frieren-back/README.md` (the same PHPUnit setup
from the framework side, §10.1), `frieren-modules-private/evilportal`'s `vitest.config.js`/
`vitest.setup.jsx` (the Vitest setup in §10.2 is adapted from there — a larger real module with
a fuller component-mocking set), and real modules in `frieren-modules`/`frieren-modules-private`
(§7) for full working examples.
