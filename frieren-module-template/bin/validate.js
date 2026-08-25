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
import * as yup from 'yup';

import { manifestSchema, validateIcon } from './manifestSchema.js';

const mainAction = async () => {
    const cwd = process.cwd();
    const publicDir = path.join(cwd, 'public');
    const manifestPath = path.join(publicDir, 'manifest.json');
    const packageJsonPath = path.join(cwd, 'package.json');

    try {
        const manifest = await fs.readJson(manifestPath);
        await manifestSchema.validate(manifest, { strict: true });

        const { errors, warnings } = validateIcon(manifest, publicDir);

        // TODO-1.5.md M4: package.json and manifest.json versions have drifted apart in
        // the wild before (a hand-edit to one without the other) and gone unnoticed until
        // release time. yarn version-bump is the only tool that bumps both together —
        // catch any other edit path here instead of relying on a downstream CI failsafe.
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            if (packageJson.version !== manifest.version) {
                errors.push(
                    `manifest.json version ("${manifest.version}") does not match package.json ` +
                    `version ("${packageJson.version}"). Run "yarn version-bump <version>" to bump both files together.`
                );
            }
        }

        warnings.forEach((warning) => console.warn(chalk.yellow(`Warning: ${warning}`)));
        if (errors.length) {
            console.error(chalk.red('Validation failed:'), errors);
            process.exit(1);
        }

        console.log(chalk.green('Validation successful: manifest.json is valid.'));
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            console.error(chalk.red('Validation failed:'), error.errors);
        } else {
            console.error(chalk.red('Unexpected error:'), error);
        }

        process.exit(1);
    }
};


/**
 * Implementation...
 */
console.log(chalk.yellow(`
    ,---,.
  ,'  .' |             ,--,
,---.'   |   __  ,-. ,--.'|                 __  ,-.                  ,---,
|   |   .' ,' ,'/ /| |  |,                ,' ,'/ /|              ,-+-. /  |
:   :  :   '  | |' | \`--'_        ,---.   '  | |' |    ,---.    ,--.'|'   |
:   |  |-, |  |   ,' ,' ,'|      /     \\  |  |   ,'   /     \\  |   |  ,"' |
|   :  ;/| '  :  /   '  | |     /    /  | '  :  /    /    /  | |   | /  | |
|   |   .' |  | '    |  | :    .    ' / | |  | '    .    ' / | |   | |  | |
'   :  '   ;  : |    '  : |__  '   ;   /| ;  : |    '   ;   /| |   | |  |/
|   |  |   |  , ;    |  | '.'| '   |  / | |  , ;    '   |  / | |   | |--'
|   :  \\    ---'     ;  :    ; |   :    |  ---'     |   :    | |   |/
|   | ,'             |  ,   /   \\   \\  /             \\   \\  /  '---'
\`----'                ---\`-'     \`----'               \`----'

 Manifest Validator - by DSR!
`));

const program = new Command();
program
    .name("manifest-validator")
    .description("CLI to validate a module's manifest.json file")
    .version("1.0.0")
    .action(mainAction);

program.parse(process.argv);
