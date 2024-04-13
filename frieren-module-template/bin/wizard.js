#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { input, checkbox, ExitPromptError, CancelPromptError } from '@inquirer/prompts';
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

// Add a custom prompt for Inquirer
const promptWithValidation = async (message, schema) => {
    return input({
        message,
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

const promptUser = async () => {
    // validations
    const stringRequiredSchema = yup.string().required('This field is required.');
    const emailSchema = yup.string().email('Please enter a valid email address').required('This field is required.');
    const urlSchema = yup.string().url('Please enter a valid URL').required('This field is required.');

    // prompts
    const title = await promptWithValidation('Module title:', stringRequiredSchema);
    const name = await promptWithValidation('Module name (e.g. my-module):', stringRequiredSchema);
    const description = await promptWithValidation('Module description:', stringRequiredSchema);
    const authorName = await promptWithValidation('Author name:', stringRequiredSchema);
    const authorEmail = await promptWithValidation('Author email:', emailSchema);
    const keywordsString = await promptWithValidation('Keywords (comma separated):', stringRequiredSchema);
    const icon = await promptWithValidation('Icon:', stringRequiredSchema);
    const repository = await promptWithValidation('Repository URL:', urlSchema);
    const bugs = await promptWithValidation('Bugs URL:', urlSchema);
    const homepage = await promptWithValidation('Homepage URL:', urlSchema);
    const guestType = await checkbox({
        message: 'Select Guest Type:',
        required: true,
        choices: [
            { name: 'OpenWrt', value: 'OpenWrt' },
            { name: 'RaspberryPi', value: 'RaspberryPi' },
        ],
    });
    const dependenciesString = await input({ message: 'Extra dependencies (comma separated):' });

    return {
        title,
        name,
        description,
        icon,
        author: {
            name: authorName,
            email: authorEmail,
        },
        keywords: keywordsString.split(',').map((part) => part.trim()),
        repository,
        bugs,
        homepage,
        guestType,
        dependencies: dependenciesString.split(',').map((part) => part.trim()),
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

const generateManifestFile = async (data) => {
    const filePath = path.join(process.cwd(), 'public', 'manifest.json');
    if (await fs.pathExists(filePath)) {
        console.log(chalk.yellow('[*] Manifest file already exists. Overwriting...'));
    }

    await fs.writeJson(filePath, data, { spaces: 2 });
    console.log(chalk.green(`[+] Manifest file generated at ${filePath}`));
}

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
    .action(async () => {
        try {
            const userInput = await promptUser();

            const manifestData = {
                ...userInput,
                system: false,
                forceSidebar: false,
                version: "1.0.0",
            };
            await updatePackageFile(manifestData);
            await generateManifestFile(manifestData);
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
    });

program.parse(process.argv);
