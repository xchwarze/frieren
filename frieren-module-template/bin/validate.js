#!/usr/bin/env node

/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import * as yup from 'yup';

// fix Yup email implementation
yup.addMethod(yup.string, 'email', function validateEmail(message) {
    return this.matches( /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message,
        name: 'email',
        excludeEmptyString: true,
    });
});

const schema = yup.object().shape({
    name: yup.string().required('Module name is required.'),
    version: yup.string().required('Version is required.'),
    description: yup.string().required('Module description is required.'),
    author: yup.object().shape({
        name: yup.string().required('Author name is required.'),
        email: yup.string().email('Must be a valid email.').required('Author email is required.'),
    }),
    system: yup.boolean().required('System flag is required.'),
    forceSidebar: yup.boolean().required('ForceSidebar flag is required.'),
    keywords: yup.array().of(yup.string()).min(1, 'At least one keyword is required.'),
    icon: yup.string().required('Icon is required.'),
    title: yup.string().required('Title is required.'),
    order: yup.number().integer().positive().optional(),
    repository: yup.string().url('Must be a valid URL.').required('Repository URL is required.'),
    bugs: yup.string().url('Must be a valid URL.').required('Bugs URL is required.'),
    homepage: yup.string().url('Must be a valid URL.').required('Homepage URL is required.'),
    guestType: yup.array().of(
        yup.string().oneOf(['OpenWrt', 'RaspberryPi'], 'GuestType must be either OpenWrt or RaspberryPi')
    ),
    dependencies: yup.array().of(yup.string()),
});

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
    .action(async () => {
        const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');

        try {
            const manifest = await fs.readJson(manifestPath);
            await schema.validate(manifest, { strict: true });

            console.log(chalk.green('Validation successful: manifest.json is valid.'));
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                console.error(chalk.red('Validation failed:'), error.errors);
            } else {
                console.error(chalk.red('Unexpected error:'), error);
            }

            process.exit(1);
        }
    });

program.parse(process.argv);
