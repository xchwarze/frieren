#!/usr/bin/env node

/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';

const VALID_RELEASE_TYPES = ['major', 'minor', 'patch'];

/**
 * Resolves the next version given the current one and a bump argument.
 * The argument can be a release type (major/minor/patch) or an exact version.
 */
const resolveNextVersion = (currentVersion, bumpArg) => {
    if (VALID_RELEASE_TYPES.includes(bumpArg)) {
        const next = semver.inc(currentVersion, bumpArg);
        if (!next) {
            throw new Error(`Failed to bump ${currentVersion} as ${bumpArg}`);
        }
        return next;
    }

    if (semver.valid(bumpArg)) {
        if (!semver.gt(bumpArg, currentVersion)) {
            throw new Error(
                `New version (${bumpArg}) must be greater than current (${currentVersion}).`
            );
        }
        return bumpArg;
    }

    throw new Error(
        `Invalid bump argument: "${bumpArg}". Use major | minor | patch | <x.y.z>`
    );
};

/**
 * Updates a JSON file's "version" field. Returns the previous version,
 * or null if the file didn't exist.
 */
const updateVersionInFile = async (filePath, newVersion) => {
    if (!await fs.pathExists(filePath)) {
        return null;
    }

    const json = await fs.readJson(filePath);
    const previous = json.version;
    json.version = newVersion;
    await fs.writeJson(filePath, json, { spaces: 2 });
    return previous;
};

const mainAction = async (bumpArg, options) => {
    const targetDir = path.resolve(process.cwd(), options.path);

    if (!await fs.pathExists(targetDir) || !(await fs.stat(targetDir)).isDirectory()) {
        console.error(chalk.red(`[!] Target is not a directory: ${targetDir}`));
        process.exit(1);
    }

    const packageJsonPath = path.join(targetDir, 'package.json');
    const manifestJsonPath = path.join(targetDir, 'public', 'manifest.json');

    if (!await fs.pathExists(packageJsonPath)) {
        console.error(chalk.red(`[!] No package.json in ${targetDir}`));
        process.exit(1);
    }

    const packageJson = await fs.readJson(packageJsonPath);
    const currentVersion = packageJson.version;

    if (!currentVersion || !semver.valid(currentVersion)) {
        console.error(chalk.red(`[!] package.json has no valid version: "${currentVersion}"`));
        process.exit(1);
    }

    let nextVersion;
    try {
        nextVersion = resolveNextVersion(currentVersion, bumpArg);
    } catch (error) {
        console.error(chalk.red(`[!] ${error.message}`));
        process.exit(1);
    }

    console.log(chalk.cyan(`[*] Target:          ${targetDir}`));
    console.log(chalk.cyan(`[*] Package:         ${packageJson.name}`));
    console.log(chalk.cyan(`[*] Current version: ${currentVersion}`));
    console.log(chalk.cyan(`[*] New version:     ${nextVersion}`));

    if (!options.yes) {
        const proceed = await confirm({
            message: `Bump version to ${nextVersion}?`,
            default: true,
        });
        if (!proceed) {
            console.log(chalk.yellow('[*] Aborted.'));
            process.exit(0);
        }
    }

    // Update package.json
    await updateVersionInFile(packageJsonPath, nextVersion);
    console.log(chalk.green(`[+] package.json: ${currentVersion} → ${nextVersion}`));

    // Update public/manifest.json
    const manifestPrev = await updateVersionInFile(manifestJsonPath, nextVersion);
    if (manifestPrev === null) {
        console.log(chalk.yellow(`[*] No manifest.json found at ${manifestJsonPath} — skipped.`));
    } else {
        console.log(chalk.green(`[+] manifest.json: ${manifestPrev} → ${nextVersion}`));
    }

    console.log(chalk.green(`\n[+] Done. New version: ${nextVersion}`));
};

const program = new Command();
program
    .name('version-bump')
    .description('Bump version in package.json and public/manifest.json')
    .argument('<bump>', 'Release type (major | minor | patch) or exact version (x.y.z)')
    .option('-p, --path <path>', 'Path to the target directory', '.')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(mainAction);

program.parse(process.argv);