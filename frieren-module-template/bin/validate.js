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
    const publicDir = path.join(process.cwd(), 'public');
    const manifestPath = path.join(publicDir, 'manifest.json');

    try {
        const manifest = await fs.readJson(manifestPath);
        await manifestSchema.validate(manifest, { strict: true });

        const { errors, warnings } = validateIcon(manifest, publicDir);
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
