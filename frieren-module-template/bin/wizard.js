#!/usr/bin/env node

/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { input, checkbox, confirm } from '@inquirer/prompts';
import { ExitPromptError, CancelPromptError } from '@inquirer/core';
import fs from 'fs-extra';
import path from 'path';

import {
    stringRequiredSchema,
    emailSchema,
    urlSchema,
    optionalUrlSchema,
    nameSchema,
    optionalSemverSchema,
} from './manifestSchema.js';

// Turn a comma-separated answer into a clean array (no empty entries).
const toList = (value) => value.split(',').map((part) => part.trim()).filter(Boolean);

// Inquirer prompt backed by a yup schema for validation.
const promptWithValidation = async (message, schema, options = {}) => {
    return input({
        message,
        ...options,
        validate: async (value) => {
            try {
                await schema.validate(value);
                return true;
            } catch (error) {
                return error.message;
            }
        },
    });
};

const promptAuthors = async () => {
    const authors = [];
    do {
        const name = await promptWithValidation('Author name:', stringRequiredSchema);
        const email = await promptWithValidation('Author email:', emailSchema);
        authors.push({ name, email });
    } while (await confirm({ message: 'Add another author?', default: false }));

    return authors;
};

const promptUser = async () => {
    const title = await promptWithValidation('Module title:', stringRequiredSchema);
    const name = await promptWithValidation('Module name (e.g. my_module):', nameSchema);
    const description = await promptWithValidation('Module description:', stringRequiredSchema);
    const authors = await promptAuthors();
    const keywordsString = await promptWithValidation('Keywords (comma separated):', stringRequiredSchema);
    const icon = await promptWithValidation('Icon (Feather glyph name or icon.png):', stringRequiredSchema);
    const repository = await promptWithValidation('Repository URL:', urlSchema);
    const documentation = await promptWithValidation('Documentation URL (optional):', optionalUrlSchema, { default: '' });
    const license = await input({ message: 'License (SPDX):', default: 'LGPL-3.0-or-later' });
    const guestType = await checkbox({
        message: 'Select Guest Type:',
        required: true,
        choices: [
            { name: 'OpenWrt', value: 'OpenWrt' },
            { name: 'RaspberryPi', value: 'RaspberryPi' },
        ],
    });
    const dependenciesString = await input({ message: 'Extra dependencies (comma separated):' });
    const minPanelVersion = await promptWithValidation('Minimum panel version (x.y.z, optional):', optionalSemverSchema, { default: '1.0.0' });

    return {
        title,
        name,
        description,
        icon,
        authors,
        keywords: toList(keywordsString),
        repository,
        documentation,
        license,
        guestType,
        dependencies: toList(dependenciesString),
        minPanelVersion,
    };
};

const updatePackageFile = async ({ name, description }) => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = name;
    packageJson.description = description;

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    console.log(chalk.green(`[+] Updated package.json`));
    console.log(chalk.green(`       name: ${name}`));
    console.log(chalk.green(`       description: ${description}`));
};

const prepareProjectConfig = async () => {
    const envPath = path.join(process.cwd(), '.env');
    const envProdPath = path.join(process.cwd(), '.env.prod');

    if (!await fs.pathExists(envPath) && await fs.pathExists(envProdPath)) {
        await fs.copy(envProdPath, envPath);
        console.log(chalk.yellow('[*] .env was created based on .env.prod'));
    }
}

// Builds the manifest in the canonical field order, dropping optional fields left empty.
const buildManifest = (data) => {
    const manifest = {
        title: data.title,
        name: data.name,
        description: data.description,
        icon: data.icon,
        authors: data.authors,
        keywords: data.keywords,
        repository: data.repository,
    };
    if (data.documentation) {
        manifest.documentation = data.documentation;
    }
    if (data.license) {
        manifest.license = data.license;
    }
    manifest.guestType = data.guestType;
    manifest.dependencies = data.dependencies;
    if (data.minPanelVersion) {
        manifest.minPanelVersion = data.minPanelVersion;
    }
    manifest.system = false;
    manifest.forceSidebar = false;
    manifest.version = '1.0.0';

    return manifest;
};

const generateManifestFile = async (manifest) => {
    const filePath = path.join(process.cwd(), 'public', 'manifest.json');
    if (await fs.pathExists(filePath)) {
        console.log(chalk.yellow('[*] Manifest file already exists. Overwriting...'));
    }

    await fs.writeJson(filePath, manifest, { spaces: 2 });
    console.log(chalk.green(`[+] Manifest file generated at ${filePath}`));
}

const mainAction = async () => {
    try {
        const userInput = await promptUser();
        const manifest = buildManifest(userInput);

        await updatePackageFile(manifest);
        await generateManifestFile(manifest);
        await prepareProjectConfig();

        console.log(chalk.green('Module created successfully!'));
    } catch (error) {
        if (error instanceof ExitPromptError || error instanceof CancelPromptError) {
            console.log(chalk.yellow('Prompt cancelled by user.'));
        } else {
            console.error(chalk.red('Unexpected error:'), error);
        }

        process.exit(1)
    }
};


/**
 * Implementation...
 */
console.log(chalk.yellow(`
      ___         ___                       ___           ___           ___           ___
     /  /\\       /  /\\        ___          /  /\\         /  /\\         /  /\\         /__/\\
    /  /:/_     /  /::\\      /  /\\        /  /:/_       /  /::\\       /  /:/_        \\  \\:\\
   /  /:/ /\\   /  /:/\\:\\    /  /:/       /  /:/ /\\     /  /:/\\:\\     /  /:/ /\\        \\  \\:\\
  /  /:/ /:/  /  /:/~/:/   /__/::\\      /  /:/ /:/_   /  /:/~/:/    /  /:/ /:/_   _____\\__\\:\\
 /__/:/ /:/  /__/:/ /:/___ \\__\\/\\:\\__  /__/:/ /:/ /\\ /__/:/ /:/___ /__/:/ /:/ /\\ /__/::::::::\\
 \\  \\:\\/:/   \\  \\:\\/:::::/    \\  \\:\\/\\ \\  \\:\\/:/ /:/ \\  \\:\\/:::::/ \\  \\:\\/:/ /:/ \\  \\:\\~~\\~~\\/
  \\  \\::/     \\  \\::/~~~~      \\__\\::/  \\  \\::/ /:/   \\  \\::/~~~~   \\  \\::/ /:/   \\  \\:\\  ~~~
   \\  \\:\\      \\  \\:\\          /__/:/    \\  \\:\\/:/     \\  \\:\\        \\  \\:\\/:/     \\  \\:\\
    \\  \\:\\      \\  \\:\\         \\__\\/      \\  \\::/       \\  \\:\\        \\  \\::/       \\  \\:\\
     \\__\\/       \\__\\/                     \\__\\/         \\__\\/         \\__\\/         \\__\\/


 Create Frieren Module - by DSR!
`));

const program = new Command();
program
    .name("create-frieren-module")
    .description("CLI to create a module configuration object and update project files")
    .version("1.0.0")
    .action(mainAction);

program.parse(process.argv);
