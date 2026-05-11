#!/usr/bin/env node

/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import semver from 'semver';

const DEP_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies'];

/**
 * Keys that identify the module itself and should always survive
 * a force overwrite. Everything else gets replaced by the template.
 */
const PRESERVED_KEYS = [
    'name',
    'version',
    'description',
    'keywords',
    'author',
    'repository',
    'bugs',
    'homepage',
];

/**
 * Files copied from template to target on every update.
 * These are project-wide config files that must stay in sync.
 */
const SYNCED_FILES = [
    '.eslintrc.cjs',
    '.gitignore',
    '.yarnrc.yml',
    'vite.config.js',
    'bin/update-module.js',
    'bin/validate.js',
    'bin/version-bump.js',
    'bin/wizard.js',
    'config/.env.dev',
    'config/.env.prod',
    'config/.env.release',
];

/**
 * Picks the higher of two semver ranges, preserving the original prefix
 * (^, ~, etc) of the winning version.
 */
const pickHigherVersion = (a, b) => {
    const minA = semver.minVersion(a);
    const minB = semver.minVersion(b);
    if (!minA) return b;
    if (!minB) return a;
    return semver.gte(minA, minB) ? a : b;
};

/**
 * Merges template dep section into target dep section.
 * - If dep is missing in target → added.
 * - If dep exists in both → highest version wins.
 * - Deps that exist only in target → kept untouched.
 */
const mergeDeps = (templateDeps = {}, targetDeps = {}) => {
    const result = { ...targetDeps };
    const changes = { added: [], updated: [], kept: [] };

    for (const [name, templateVersion] of Object.entries(templateDeps)) {
        const targetVersion = result[name];
        if (!targetVersion) {
            result[name] = templateVersion;
            changes.added.push(`${name}@${templateVersion}`);
            continue;
        }
        const winner = pickHigherVersion(templateVersion, targetVersion);
        if (winner !== targetVersion) {
            result[name] = winner;
            changes.updated.push(`${name}: ${targetVersion} → ${winner}`);
        } else {
            changes.kept.push(`${name}@${targetVersion}`);
        }
    }

    // Sort keys alphabetically (yarn-style)
    const sorted = Object.fromEntries(
        Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
    );
    return { result: sorted, changes };
};

/**
 * Force mode: copy the whole template package.json,
 * but preserve module-identifying metadata from the target
 * (name, version, description, author, repo, etc).
 */
const applyForce = (templatePkg, targetPkg) => {
    const result = { ...templatePkg };
    for (const key of PRESERVED_KEYS) {
        if (targetPkg[key] !== undefined) {
            result[key] = targetPkg[key];
        } else {
            // Target didn't have it — drop the template's value too,
            // so we don't accidentally inject template metadata.
            delete result[key];
        }
    }
    return result;
};

/**
 * Default mode: merge dep sections from template into target.
 */
const applyMerge = (templatePkg, targetPkg) => {
    const merged = { ...targetPkg };
    const summary = {};
    for (const section of DEP_SECTIONS) {
        if (!templatePkg[section]) continue;
        const { result, changes } = mergeDeps(templatePkg[section], targetPkg[section]);
        merged[section] = result;
        summary[section] = changes;
    }
    return { merged, summary };
};

const printMergeSummary = (summary) => {
    for (const [section, changes] of Object.entries(summary)) {
        if (!changes.added.length && !changes.updated.length) continue;
        console.log(chalk.cyan(`\n  [${section}]`));
        changes.added.forEach((c) => console.log(chalk.green(`    + ${c}`)));
        changes.updated.forEach((c) => console.log(chalk.yellow(`    ↑ ${c}`)));
    }
};

/**
 * Copies all SYNCED_FILES from template to target, overwriting silently.
 * Files that don't exist in the template are reported and skipped.
 */
const syncFiles = async (templateDir, targetDir) => {
    console.log(chalk.cyan(`\n[*] Syncing config files...`));

    for (const file of SYNCED_FILES) {
        const sourcePath = path.join(templateDir, file);
        const destPath = path.join(targetDir, file);

        if (!await fs.pathExists(sourcePath)) {
            console.log(chalk.yellow(`    ! ${file} (not in template — skipped)`));
            continue;
        }

        await fs.copy(sourcePath, destPath, { overwrite: true });
        console.log(chalk.green(`    ✓ ${file}`));
    }
};

const verifyBuild = (targetDir) => {
    console.log(chalk.cyan(`\n[*] Verifying build in ${targetDir}...`));
    try {
        execSync('yarn build --mode release', { cwd: targetDir, stdio: 'inherit' });
        console.log(chalk.green(`\n[+] Build OK`));
    } catch {
        console.error(chalk.red(`\n[!] Build FAILED`));
        process.exit(1);
    }
};

const reinstallDeps = (targetDir) => {
    const lockPath = path.join(targetDir, 'yarn.lock');
    if (fs.existsSync(lockPath)) {
        fs.removeSync(lockPath);
        console.log(chalk.yellow(`[*] Removed ${lockPath}`));
    }

    console.log(chalk.cyan(`[*] Running 'yarn install' in ${targetDir}...`));
    execSync('yarn install', { cwd: targetDir, stdio: 'inherit' });
};

const mainAction = async (targetArg, options) => {
    const cwd = process.cwd();
    const targetDir = path.resolve(cwd, targetArg);

    // Validations
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        console.error(chalk.red(`[!] Target is not a directory: ${targetDir}`));
        process.exit(1);
    }

    const templatePkgPath = path.join(cwd, 'package.json');
    const targetPkgPath = path.join(targetDir, 'package.json');

    if (!fs.existsSync(templatePkgPath)) {
        console.error(chalk.red(`[!] No package.json found in current directory.`));
        process.exit(1);
    }
    if (!fs.existsSync(targetPkgPath)) {
        console.error(chalk.red(`[!] No package.json found in target: ${targetDir}`));
        process.exit(1);
    }
    if (path.resolve(templatePkgPath) === path.resolve(targetPkgPath)) {
        console.error(chalk.red(`[!] Target and template are the same package.json.`));
        process.exit(1);
    }

    const templatePkg = await fs.readJson(templatePkgPath);
    const targetPkg = await fs.readJson(targetPkgPath);

    console.log(chalk.cyan(`[*] Template: ${templatePkg.name}@${templatePkg.version}`));
    console.log(chalk.cyan(`[*] Target:   ${targetPkg.name}@${targetPkg.version}`));
    console.log(chalk.cyan(`[*] Mode:     ${options.force ? 'FORCE (overwrite)' : 'MERGE'}`));

    let finalPkg;
    if (options.force) {
        finalPkg = applyForce(templatePkg, targetPkg);
        console.log(chalk.green('\n[+] Forced overwrite — preserved module metadata only.'));
    } else {
        const { merged, summary } = applyMerge(templatePkg, targetPkg);
        finalPkg = merged;
        printMergeSummary(summary);
    }

    await fs.writeJson(targetPkgPath, finalPkg, { spaces: 2 });
    console.log(chalk.green(`\n[+] Updated ${targetPkgPath}`));

    if (options.files) {
        await syncFiles(cwd, targetDir);
    } else {
        console.log(chalk.yellow(`\n[*] Skipped config files (omit --no-files to copy).`));
    }

    if (options.install) {
        reinstallDeps(targetDir);
        console.log(chalk.green(`\n[+] Done.`));
    } else {
        console.log(chalk.yellow(`\n[*] Skipped install (omit --no-install to run yarn).`));
    }

    if (options.build) {
        verifyBuild(targetDir);
    }
};

const program = new Command();
program
    .name('update-module')
    .description('Sync a module package.json with this template')
    .argument('<target>', 'Path to the module directory to update')
    .option('-f, --force', 'Replace the whole package.json, preserving only module metadata')
    .option('--no-files', 'Skip copying config files (.gitignore, vite.config.js, etc)')
    .option('--no-install', 'Skip removing yarn.lock and running yarn install')
    .option('-b, --build', 'Run build verification after update')
    .action(mainAction);

program.parse(process.argv);