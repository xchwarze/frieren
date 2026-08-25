# TODO 1.5 — Frieren framework backlog

Actionable backlog of real bugs/discrepancies found while writing
`frieren-module-template/CHEATSHEET.md` (3 rounds of code review, verified by reading and
executing the real code). This is a maintainer backlog for a future fix session, not a usage
guide — see `frieren-module-template/CHEATSHEET.md` §8 for the user-facing version of some of
these gotchas.

All items re-verified against the current tree on 2026-08-23. File:line citations below are
accurate as of that date unless noted otherwise.

Legend: `- [ ] Not started` → update to `- [x] Done` (with commit/PR ref) as items are fixed.

---

## Critical

- [x] Done — **C1. `yup` is an unresolvable dependency in `frieren-module-template`**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/bin/manifestSchema.js` and `bin/validate.js` do
    `import * as yup from 'yup'`. In `frieren-module-template/package.json`, `yup` is listed
    **only** under `peerDependencies` (line 30) — never installed by `yarn install` — and no
    transitive dependency hoists a copy into `node_modules`.
    Reproduced live: `cd frieren-module-template && node ./bin/validate.js` →
    `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'yup' imported from
    .../bin/validate.js`.
  - **Why it matters:** Breaks `yarn wizard` and `yarn validate`, the two primary scaffolding
    commands the template exists for. Anyone following the README's documented workflow hits
    this immediately after `yarn install`.
  - **Fix:** Move `yup` from `peerDependencies` to `devDependencies` (it's peer for the
    *built module's* runtime, but the *tooling scripts* need their own real copy). Do the same
    audit for `semver` (see I1).

- [x] Done — **C2. `SQLite::find()` throws a fatal `TypeError` instead of returning `null`/`[]` on no match**
  - **Area:** Backend core `frieren-back`
  - **Evidence:** `frieren-back/api/orm/SQLite.php:108` declares
    `public function find(string $table, array $conditions, array $columns = []): array`
    (non-nullable `array` return type), but line 118 does
    `return $result->fetchArray(SQLITE3_ASSOC) ?: null;`. When there's no matching row, PHP
    throws `TypeError: find(): Return value must be of type array, null returned` — the
    docblock above it (lines 101-106) already (incorrectly) documents the return as
    `array|null`, out of sync with the actual signature.
    `frieren-back/api/core/ApiCore.php:166` only catches `\Exception`, not `\Throwable`, so
    this `TypeError` is **not** caught and converted into a clean `{"error": ...}` JSON
    response — it surfaces as a broken/empty response instead.
  - **Why it matters:** Any module (core or third-party) that uses `find()` to look up a
    single row by id/key, where that id may not exist (the single most common use case for a
    "find one" method), crashes with an uncaught fatal instead of a handled "not found".
  - **Fix:** Change the return type to `?array` and return `null` explicitly (or `[]`, if that
    contract is preferred — audit existing/future callers either way). Consider also widening
    `ApiCore::handleRequest()`'s catch to `\Throwable` as defense in depth.

---

## Important

- [x] Done — **I1. `semver` is an undeclared dependency in `frieren-module-template`**
  - **Area:** Module Template tooling
  - **Evidence:** Imported directly in `frieren-module-template/bin/manifestSchema.js:16`,
    `bin/update-module.js:14`, and `bin/version-bump.js:14`, but absent from every
    dependency block in `package.json`. Currently resolves only because it's hoisted
    transitively (confirmed in `yarn.lock`: `semver@npm:^6.3.1`, `semver@npm:^7.7.3`, etc.,
    pulled in by other deps) — fragile, can silently break on any dependency bump.
  - **Why it matters:** Same class of bug as C1 but not yet triggering — a ticking time bomb.
  - **Fix:** Declare `semver` explicitly in `devDependencies`.

- [x] Done — **I2. Wizard's ".env from .env.prod" step is a silent no-op**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/bin/wizard.js`, `prepareProjectConfig()`
    (lines 105-113) looks for `.env`/`.env.prod` at `process.cwd()` (the project root).
    The real env files live in `config/` (confirmed: `frieren-module-template/config/`
    contains `.env.dev`, `.env.prod`, `.env.release`; nothing at the project root), and
    `vite.config.js:95` itself does `loadEnv(resolvedMode, \`${process.cwd()}/config\`)`.
    The wizard's check (`!await fs.pathExists(envPath) && await fs.pathExists(envProdPath)`)
    is always false at the root, so the copy never runs and the log line
    (`'[+] .env was created based on .env.prod'`) never prints — README §"Module Wizard"
    still claims this step does something.
  - **Why it matters:** Dead code that misleads anyone reading the wizard output or the
    README into thinking env setup is automated when it isn't.
  - **Fix:** Point `envPath`/`envProdPath` at `config/.env` / `config/.env.prod`, or remove
    the step (and the README claim) if it isn't actually needed.

- [x] Done — **I3. Wizard hardcodes `forceSidebar: false` and `version: '1.0.0'` without asking**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/bin/wizard.js`, `buildManifest()`, lines 137-139:
    `manifest.system = false; manifest.forceSidebar = false; manifest.version = '1.0.0';`
    always fixed, even though `bin/manifestSchema.js` treats `forceSidebar` as a required,
    themeoretically-configurable field.
  - **Why it matters:** A module that should default to appearing in the sidebar doesn't,
    until someone manually edits the generated manifest — easy to miss for first-time module
    authors.
  - **Fix:** Add a wizard prompt for `forceSidebar` (and consider whether `version` should be
    an editable default too), or explicitly document in the README that these are
    intentionally fixed and why.

- [x] Done — **I4. Plain `yarn build` hangs indefinitely (bundle analyzer defaults to server mode)**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/config/.env.prod:7` ships
    `VITE_ANALYZER_ENABLE=true` by default. `vite.config.js:142-146` wires that flag straight
    to `vite-bundle-analyzer`'s `analyzer()` plugin with no `analyzerMode` override, and the
    plugin's own default (confirmed in
    `node_modules/vite-bundle-analyzer/dist/index-DQxw9DwE.js`) is
    `analyzerMode:"server"` — a mode that opens an HTTP server and never exits the process.
    (`config/.env.dev` and `config/.env.release` both correctly default this to `false` —
    only `.env.prod`, i.e. the plain `yarn build` target, has it `true`.)
  - **Why it matters:** Any unattended/CI `yarn build` (no `--mode`) hangs forever instead of
    exiting — a real trap for anyone scripting the build.
  - **Fix:** Flip the default in `config/.env.prod` to `VITE_ANALYZER_ENABLE=false`, and/or
    force `analyzerMode: 'static'` in `vite.config.js` so the plugin never blocks even if
    enabled.

- [x] Done — **I5. `HelperInterface.php` is out of sync with `OpenWrtHelper` and isn't even enforced**
  - **Area:** Backend core `frieren-back`
  - **Evidence:** `frieren-back/api/helper/HelperInterface.php` is missing 8 methods that
    `frieren-back/api/helper/OpenWrtHelper.php` actually implements and that other code
    depends on: `commandExists` (OpenWrtHelper.php:81), `uciReadConfig` (:148),
    `uciGetJson` (:172), `uciSetJson` (:197), `uciGetConfig` (:226), `uciGetSection` (:242),
    `hasInternetConnection` (:344), `logger` (:360). On top of that,
    `OpenWrtHelper.php:16` declares `class OpenWrtHelper` with **no** `implements
    HelperInterface` at all, so PHP never actually validates the contract — the interface is
    pure aspirational documentation that has drifted from reality.
  - **Why it matters:** `HelperInterface` is supposed to be *the* extension point for
    non-OpenWrt platforms (per `frieren/CLAUDE.md`: "extensible via `HelperInterface`"); as
    written it would mislead anyone implementing a second platform helper into thinking the
    listed methods are the full contract.
  - **Fix:** Update `HelperInterface` to list the real method set, and add
    `implements HelperInterface` to `OpenWrtHelper` so the compiler enforces it going
    forward.

- [x] Done — **I6. `VITE_SOURCEMAP` vs `VITE_SOURCEMAP_ENABLE` mismatch — affects both `frieren-module-template` AND `frieren-front`**
  - **Area:** Module Template tooling / Frontend SDK `frieren-front`
  - **Evidence:**
    - `frieren-module-template/vite.config.js:148` reads `env.VITE_SOURCEMAP_ENABLE`, but
      `config/.env.dev:8`, `.env.prod:8`, `.env.release:8`, and the README all set/document
      `VITE_SOURCEMAP` (no `_ENABLE` suffix).
    - **Same bug exists in the core SDK, not just the template:**
      `frieren-front/vite.config.js:107` also reads `env.VITE_SOURCEMAP_ENABLE`, while
      `frieren-front/config/.env.dev:11`, `.env.prod:11`, `.env.release:11`, and
      `frieren-front/CLAUDE.md:191` all document the variable as `VITE_SOURCEMAP`.
  - **Why it matters:** Setting the documented `VITE_SOURCEMAP=true` in any `.env.*` file, in
    either repo, has zero effect — sourcemaps are silently never generated via that
    documented path.
  - **Fix:** Pick one name and apply it consistently in both repos — either rename the code
    to read `VITE_SOURCEMAP`, or rename the `.env.*` files/READMEs/CLAUDE.md to
    `VITE_SOURCEMAP_ENABLE` (recommend the latter, for consistency with the sibling
    `VITE_ANALYZER_ENABLE` / `VITE_COMPRESSION_ENABLE` / `VITE_MANUAL_CHUNKS_ENABLE` flags,
    which already use the `_ENABLE` suffix in both repos).

---

## Backend Controllers — found while writing the PHPUnit test suite (2026-08-23)

A full PHPUnit battery was added for all 10 built-in `frieren-back` modules
(`frieren-back/tests-php/*ControllerTest.php`, 164 tests / 603 assertions, all green — includes
regression tests that pin some of these behaviors). These items surfaced organically while
writing that suite, each backed by a reproducing test.

- [x] Done — **I7. `OpenWrtHelper::exec()` can fatal with a `TypeError` instead of returning `false` when the underlying `exec()` call doesn't populate `$output`**
  - **Area:** Backend core `frieren-back`
  - **Evidence:** `frieren-back/api/helper/OpenWrtHelper.php`, `exec($command, $merge=true, $raw=false)`:
    calls the global `exec($command, $output, $retval)`, then when `$merge` is true (the
    default) does `implode("\n", $output)`. If the command "succeeds" (`$retval === 0`) but
    the global `exec()` never writes to `$output` (observed for real while mocking a silent
    command like `ping` in a test, and independently by two different agents testing unrelated
    modules), `$output` stays `null`/unset and the `implode()` call throws a `TypeError`
    instead of `OpenWrtHelper::exec()` returning cleanly. Needs a maintainer to confirm the
    exact PHP-version-specific mechanics, but the practical repro (mock `exec()` without
    setting the `$output` by-ref parameter) is solid.
  - **Why it matters:** Any real command that can legitimately succeed with zero lines of
    output (not just a test-mocking mistake) would crash the whole request the same way — and
    per C2/M-pattern above, `ApiCore` only catches `\Exception`, not `\Throwable`, so this
    surfaces as a broken response, not a clean error.
  - **Fix:** Initialize `$output = [];` before the global `exec()` call in `OpenWrtHelper::exec()`
    so `implode()` always has a real (possibly empty) array to work with.

- [x] Done — **M9. `ModulesController::installModule()`/`downloadModule()` build a filesystem path from `moduleName` before the whitelist check runs (code-hygiene note — no security/functional impact; re-reviewed and downgraded, see below)**
  - **Area:** Backend core `frieren-back` (`modules/modules/ModulesController.php`)
  - **Does NOT affect real usage — confirmed on real hardware against the real module feed.**
    `moduleName` always comes from `getAvailableModules()` (the official
    `frieren-modules-release` catalog), which only ever contains valid `^[a-z0-9_]+$` names, so
    the checksum check is meaningful and `removeModuleFiles()`'s validation (line 289) always
    passes. Requires an already-authenticated session too (session+CSRF gate on every action
    but `login`).
  - **Re-reviewed: earlier drafts of this item called this an "information-disclosure oracle" —
    that claim doesn't hold up and is retracted.** `hash_file()` on a path that doesn't exist
    returns `false` (verified), and `false !== $checksum` is `true` — the exact same
    `"Checksum mismatch"` response as an existing file with the wrong content. The
    "no-such-path" and "wrong-content" cases are indistinguishable, so there is nothing to
    distinguish *unless* the caller already knows the exact SHA256 of the real target file —
    at which point they already know its content and nothing new is disclosed. There is no
    working oracle here.
  - **What's actually left, scoped correctly:** purely a code-ordering/hygiene observation —
    `installModule()` (line 227) reads `$moduleName` and uses it to build a path (`hash_file()`
    on line 232) before `removeModuleFiles()` (called on line 236) applies the only whitelist
    check (line 289) in this flow; `downloadModule()` builds its path/URL the same way. With a
    `moduleName` the real UI never sends (e.g. containing `/`), the checksum step touches a
    path outside the intended flat `/tmp/{name}.tar.gz` layout before being rejected one line
    later — but produces no observable difference in behavior/response either way, and the
    actual extraction is never reached regardless. `tests-php/ModulesControllerTest.php` documents
    today's ordering; it does not demonstrate any exploitable behavior.
  - **Fix (nice-to-have, not urgent):** Validate `moduleName` against the whitelist at the very
    start of `installModule()`/`downloadModule()`, purely so the guard is visible where the
    path is built instead of "borrowed" from a cleanup method — a readability/defensive-order
    improvement, not a bug fix.

- [x] Done — **M10. `SettingsController` accepts `hostname`/`timezone`/`theme` values with no format/enum validation**
  - **Area:** Backend core `frieren-back` (`modules/settings/`)
  - **Evidence:** Neither `ModuleOpenWrtHelper::setSystemHostname()` nor
    `SettingsController::setHostname()` whitelist the hostname's charset (only
    `escapeshellarg()` protects the shell layer — no injection risk, but an invalid RFC-1123
    hostname like `"evil host; rm -rf /"` is accepted and persisted verbatim to UCI and
    `/proc/sys/kernel/hostname`). Same gap for `setTimezone` (any string is accepted; only
    strings containing the literal substring `"GMT"` get their sign flipped, everything else
    is stored as-is) and `setPanelTheme` (should be one of `'auto'|'dark'|'light'` per
    `frieren-front/CLAUDE.md`, but any string is accepted). The frontend yup schemas
    (`hostnameSchema`, `timezoneSchema`) only enforce `required()`, no format/enum either — so
    there's no validation on either side of the wire. By contrast, `saveTerminalSettings()`
    in the same controller *does* validate `cursorStyle` against a real enum
    (`in_array(..., ['block','underline','bar'], true)`), showing the pattern is known and
    just wasn't applied here. Reproduced in `tests-php/SettingsControllerTest.php`.
  - **Why it matters:** Not a security hole (no shell/SQL injection surface — `escapeshellarg`
    covers that), but a data-integrity/robustness gap: a malformed hostname or a
    theme value the frontend doesn't recognize can be persisted with no server-side pushback.
  - **Fix:** Add a hostname charset whitelist (e.g. `^[a-zA-Z0-9-]{1,63}$` per RFC-1123), an
    IANA timezone/offset whitelist, and the same 3-value enum check used for
    `cursorStyle`, applied consistently to `theme`.

- [x] Done — **M11. `WirelessController::getWirelessOverview()` has an operator-precedence bug (`&&` vs `??`)**
  - **Area:** Backend core `frieren-back` (`modules/wireless/ModuleOpenWrtHelper.php`, around
    line 150 as of this writing)
  - **Evidence:** `if ($radioInfo['up'] && $iwinfo['phy'] ?? null) { ... }` — PHP's `??` binds
    *looser* than `&&`, so this parses as `($radioInfo['up'] && $iwinfo['phy']) ?? null`, not
    the presumably-intended `$radioInfo['up'] && ($iwinfo['phy'] ?? null)`. Currently harmless
    in practice (the outer `??` can never actually trigger, since `&&` always yields a real
    `bool`, never `null`) — but if `$iwinfo` doesn't have a `'phy'` key at all (vs. having it
    set to `null`), PHP 8 emits an "Undefined array key" warning that the `??` was clearly
    meant to suppress and doesn't.
  - **Why it matters:** Latent correctness bug — silently doesn't do what the code visually
    suggests it does; the current behavior is accidental, not designed.
  - **Fix:** Add explicit parentheses: `$radioInfo['up'] && ($iwinfo['phy'] ?? null)`.

- [x] Done — **M12. `SystemController::getSystemLogs()`'s `search` param is double-shell-escaped, corrupting patterns with shell metacharacters**
  - **Area:** Backend core `frieren-back` (`modules/system/`)
  - **Evidence:** `getSystemLogs()` builds the `logread -e '<search>'` argument with its own
    `escapeshellarg()`, but the resulting full command string is then passed through
    `OpenWrtHelper::exec($command, false)` — i.e. `$raw` defaults to `false`, so
    `OpenWrtHelper::exec()` additionally runs the **entire command line** through
    `escapeshellcmd()`. `escapeshellcmd()` still escapes metacharacters *inside* already
    correctly single-quoted segments, so a search term containing `;`, `#`, or `|` arrives at
    `logread` backslash-escaped (e.g. `-e 'kern\; rm -rf / \#'`) rather than as the literal
    string the user typed. No injection risk either way (this is a robustness/correctness
    finding, not a security one) — but a legitimate search containing those characters won't
    match what the user expects. Reproduced in
    `tests-php/SystemControllerTest.php::testGetSystemLogsEscapesShellMetacharactersInSearchParameter`.
  - **Why it matters:** Silent, confusing functional bug — a user searching logs for a pattern
    with common punctuation gets no matches (or the wrong ones) with no error to explain why.
  - **Fix:** Call `OpenWrtHelper::exec($command, true, true)` (raw) for this command, matching
    the pattern already used elsewhere in the codebase (e.g. `execUbusCall`) when the caller
    has already escaped every interpolated piece itself.

- [x] Done — **M13. `ModulesController::getModuleList()`/`getInstalledModules()` are not unit-testable without touching the real filesystem root**
  - **Area:** Backend core `frieren-back` (`modules/modules/ModulesController.php`) — test
    infrastructure note, not a functional bug.
  - **Evidence:** Both actions scan `\DeviceConfig::MODULE_ROOT_FOLDER` (hardcoded
    `/frieren/modules`) via `new \DirectoryIterator(...)`, a class instantiation rather than a
    global function — `php-mock/php-mock-phpunit` (the mocking approach used for the rest of
    this suite) can only intercept unqualified **function** calls, not `new SomeClass()`
    construction. On a dev/CI host without `/frieren/modules` (i.e. everywhere but a real
    device), both actions currently just throw an uncaught `UnexpectedValueException` — which
    is itself the *only* behavior the new tests can assert on for these two actions.
  - **Why it matters:** These are two of the module system's most-used read actions
    (`getModuleList` backs the entire sidebar/routing discovery on every page load, per
    `frieren-front`), and they currently have no real happy-path test coverage.
  - **Fix:** Extract the directory scan into a small method on `ModuleOpenWrtHelper` (mirroring
    the existing `getAllModuleSizes()`, which already delegates filesystem work to a
    `OpenWrtHelper::exec()` call instead of raw PHP filesystem classes) so it can be mocked the
    same way as every other OS-touching call in the codebase.

---

## Minor

- [x] Done — **M1. `Router::loadModule()` has a path-traversal defense commented out**
  - **Area:** Backend core `frieren-back`
  - **Evidence:** `frieren-back/api/core/Router.php:57-58`:
    ```php
    //$moduleRealPath = realpath($moduleFilePath);
    //if (!$moduleRealPath || strpos($moduleRealPath, $baseDir) !== 0) {
    ```
    dead code left in place of a `realpath()` + prefix check before `require()`-ing the
    controller file. Today the only actual defense is the `^[a-z0-9_]+$` regex in
    `routeModule()` (Router.php:37), which already blocks `.`/`/` and therefore blocks `../`
    — so this is not currently exploitable, just defense-in-depth that was silently disabled.
  - **Why it matters:** Dead/commented security code with no explanation is a maintenance
    hazard — a future refactor of the regex could reopen the gap without anyone noticing the
    second layer was already removed.
  - **Fix:** Either re-enable the `realpath()` check, or delete it and add a one-line comment
    explaining why the regex alone is considered sufficient.

- [x] Done — **M2. `Controller::TASK_DEPENDENCIES` is a single global lock shared by every module**
  - **Area:** Backend core `frieren-back`
  - **Evidence:** `frieren-back/api/core/Controller.php:20`:
    `const TASK_DEPENDENCIES = 'fm-dependencies';` — the same fixed string used for
    every module's dependency-install background task (used at lines 174, 179, 191, 192).
  - **Why it matters:** If module A is installing its opkg dependencies, module B cannot
    install its own (unrelated) dependencies at the same time — it gets "Installation in
    progress" for a task that isn't even about its packages. May be an accepted design
    limitation (only one opkg transaction system-wide is arguably safer), but it should be a
    deliberate decision, not an accident of a shared constant name.
  - **Fix:** Either document this as an intentional global mutex, or scope the task name per
    module, e.g. `"fm-dependencies-{$moduleName}"`.

- [ ] Not started — **M3. `@frieren/terminal-core` missing from the module template's externals/globals**
  - **Area:** Module Template tooling / Frontend SDK `frieren-front`
  - **Evidence:** `frieren-front/src/helpers/umdSupport.js:22,45` imports
    `@frieren/terminal-core` and exposes it as `window.Frieren.TerminalCore`, but
    `frieren-module-template/vite.config.js`'s `EXTERNAL_DEPS` (lines 16-32) and
    `GLOBALS_MAP` (lines 34-50) have no entry for it.
  - **Why it matters:** A third-party module wanting to embed the terminal has to
    hand-patch the template's Vite config to externalize it correctly, instead of it working
    out of the box like every other shared lib.
  - **Fix:** Add `@frieren/terminal-core` → `Frieren.TerminalCore` to both arrays in the
    template.

- [ ] Not started — **M4. `manifest.json` version drifts one patch ahead of `package.json` across published modules**
  - **Area:** Specs/docs (release pipeline)
  - **Evidence:** Checked all 9 modules in the `frieren-modules` repo:
    | module | package.json | manifest.json |
    |---|---|---|
    | demo | 1.1.1 | 1.1.2 |
    | tcpdump | 1.1.1 | 1.1.2 |
    | nmap | 1.1.1 | 1.1.2 |
    | dnsspoof | 1.1.1 | 1.1.2 |
    | wigle | 1.0.1 | 1.0.2 |
    | hcxdumptool | 1.0.2 | 1.0.3 |
    | proxyhelper | 1.0.0 | 1.0.1 |
    | usbstorage | 1.0.4 | 1.0.5 |
    | wpaonlinecrack | 1.1.3 | 1.1.3 (matches) |

    8 of 9 modules show `manifest.json` exactly one patch ahead of `package.json`
    (broader than the "4 of 5" originally spot-checked — re-verified across the full repo).
    Suggests the release pipeline bumps the manifest separately without syncing
    `package.json` back.
  - **Why it matters:** Not blocking, but it's a real, consistent, repo-wide drift that will
    confuse anyone trying to use `package.json.version` as the source of truth (e.g.
    tooling, update-module.js's version comparisons).
  - **Fix:** Investigate the publish/release pipeline for `frieren-modules`; decide whether
    `yarn version-bump` (`frieren-module-template/bin/version-bump.js`, which bumps both
    files together) should be the mandatory single entry point for version bumps, and audit
    whatever script currently touches the manifest independently.

- [ ] Not started — **M5. Double-slash typo in an import path**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/src/feature/hooks/useSystemStats.js:9`:
    `import { DEMO_GET_SYSTEM_STATS } from '@module/feature//helpers/queryKeys.js';`
    (double `/` before `helpers`). Harmless — bundlers/Node tolerate it — but it's the
    literal starter code every scaffolded module copies from.
  - **Why it matters:** Purely cosmetic, but it's in the reference/starter code new modules
    are based on, so it gets propagated.
  - **Fix:** Remove the duplicate slash.

- [ ] Not started — **M6. Template README references an image path that breaks when the template is used standalone**
  - **Area:** Module Template tooling
  - **Evidence:** `frieren-module-template/README.md:3`: `![Mascot](../assets/blueprint.png)`
    — resolves correctly only when `frieren-module-template/` sits inside the `frieren/`
    monorepo (`frieren/assets/blueprint.png` exists there), but breaks under the very
    workflow the README itself describes first ("clone `frieren-module-template` and use it
    as a base" — step 1 in the "Getting Started" section).
  - **Why it matters:** Minor cosmetic breakage for anyone who follows the README's own
    suggested standalone-clone workflow.
  - **Fix:** Either use an absolute GitHub URL for the image, or drop it from the standalone
    README.

- [ ] Not started — **M7. `ui-layout.spec.md` component-variants table incorrectly bans plain `Tab` (not just `Tabs`)**
  - **Area:** Specs/docs
  - **Evidence:** `frieren/specs/ui-layout.spec.md:80` (under "Component variants over raw
    react-bootstrap", heading at line 67):
    `| PanelTabs (components/Tabs/PanelTabs) | Tabs / Tab | |` — lists both `Tabs` and `Tab`
    as "do NOT import directly". But `PanelTabs.jsx` (`frieren-front/src/components/Tabs/
    PanelTabs.jsx:9,18-19`) itself imports `Tab` from `react-bootstrap/Tab` directly and its
    docblock explains why: "Returns a real `<Tab>` so react-bootstrap `<Tabs>` can
    introspect it to render the nav." Confirmed 7 real direct imports of
    `react-bootstrap/Tab` across published modules in `frieren-modules`
    (`usbstorage`, `wpaonlinecrack`, `wigle`, `hcxdumptool`, `proxyhelper`, `tcpdump`,
    `nmap` — all `Screen/index.jsx`), plus 4 more in `frieren-modules-private`
    (`mdk4`, `recon` ×2, `evilportal`) — all correct usage per the `renderPanelTab` pattern,
    not spec violations.
  - **Why it matters:** The spec as written would make a linter/reviewer flag correct,
    required code as a violation. `Tabs` (the container) is the thing that should never be
    imported raw; `Tab` (the item passed as a child) always must be.
  - **Fix:** Change the table cell to `Tabs` only, and add a note clarifying that `Tab`
    (singular) is always imported directly as the child element for `renderPanelTab`.

- [ ] Not started — **M8. `PanelCard.showRefresh` defaults to `true` even with no `refetch` handler**
  - **Area:** Frontend SDK `frieren-front`
  - **Evidence:** `frieren-front/src/components/PanelCard/index.jsx:36`:
    `showRefresh = true` — a `<PanelCard>` used without passing `refetch` still renders an
    enabled-looking refresh button whose `onClick` is `undefined`, unless the consumer
    explicitly passes `showRefresh={false}`.
  - **Why it matters:** UX footgun that's easy to carry into new modules/cards that don't
    have a refetchable query — a visible button that silently does nothing on click.
  - **Fix:** Either default `showRefresh` to `false` and require it to be opted in, or derive
    it automatically from whether `refetch` was passed (`showRefresh = !!refetch` unless
    explicitly overridden).

---

## Summary

| Severity | Count |
|---|---|
| Critical | 2 |
| Important | 7 |
| Minor | 13 |
| **Total** | **22** |

(Items C1-C2/I1-I6/M1-M8 came from the `CHEATSHEET.md` review rounds; I7/M9-M13 came from
writing the `frieren-back` PHPUnit suite — see that section above for the reproducing tests.
M9 in particular does **not** affect real-world operation — confirmed against a real device
with the real module feed — it's a validation-ordering note for hand-crafted/malformed input,
see its entry for the full scoping.)
