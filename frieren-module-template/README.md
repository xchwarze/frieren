# Frieren Module Template

![Mascot](../assets/blueprint.png)

## Description

The `frieren-module-template` is designed as a scaffolding tool to facilitate the development of new modules extending the Frieren project. Utilizing the generation of UMD libraries, it aims to simplify the creation and integration of modular features, enhancing the Frieren ecosystem with reusable and distributable components.

## Getting Started

To begin developing your own module for the Frieren project, follow these steps:

1. **Setup**: Clone the repository and install both `frieren-front` and `frieren-module-template` dependencies with `yarn install`.
2. **Feature Creation**: In the `frieren-front` project, create a new feature. Utilize the `@module` alias to ensure this new feature is completely isolated.
3. **Module Wizard**: Navigate to the `frieren-module-template` directory in your console and execute `yarn wizard`. Follow the wizard's guidance through the setup process. This command will also use as .env the .env.prod file.
4. **Feature Integration**: Transfer the isolated feature from `frieren-front` to `frieren-module-template`, connecting it to `entry.jsx`. Remember to correct the paths by doing a mass replace similar to this: `features/tcpdump` -> `feature`.
5. **Build Module**: In the `frieren-module-template` project, run `yarn build` to compile your module.
6. **Finalize and Publish**: Rename the module folder to match your module's name and upload it to GitHub.
7. **Explore Existing Modules**: For inspiration or guidance, you can view a variety of already developed modules in the official [module repository](https://github.com/xchwarze/frieren-modules). These modules demonstrate practical solutions to common challenges such as dependency management and data handling via polling, serving as valuable templates for similar functionalities in new modules.

## Module Development

This template comes equipped with various scripts to aid in your module development:

- `build`: Compiles your module into a distributable format.
- `wizard`: A guided setup to scaffold your module.
- `validate`: Ensures your module meets the required specifications.

## Advanced Examples for Reference

This section provides insights into more complex scenarios that you might encounter while developing modules for the Frieren project. These examples highlight advanced usage of the framework's capabilities and can serve as a reference for implementing sophisticated features in your modules.

- **[WPA Online Crack](https://github.com/xchwarze/frieren-modules/tree/master/wpaonlinecrack)**: This example demonstrates the automatic dependency installation system. It illustrates how the module seamlessly integrates required libraries without manual interventions, ensuring that all dependencies are correctly managed and installed.
- **[TCP Dump](https://github.com/xchwarze/frieren-modules/tree/master/tcpdump)**: Here, you can see a variation of the dependency installation system, which includes additional checks performed by a third-party module. This ensures that all dependencies not only get installed but are also verified and validated against specific criteria before being utilized.
- **[WPA Online Crack](https://github.com/xchwarze/frieren-modules/tree/master/wpaonlinecrack)**: This example provides insights into using the system to persist configurations. It shows how to effectively save and retrieve configuration settings to ensure that data persistence is maintained across sessions, which is crucial for modules that require state management.

These examples are designed to provide a deeper understanding of how you can leverage the Frieren project's infrastructure to develop robust and efficient modules.

## Common Configuration

In the root of this project, the `config` folder contains common configurations essential for compiling modules. Here is an example of the configurations available:

```env
# API gateway
VITE_RELATIVE_API_PATH=api/index.php

# for build
VITE_COMPRESSION_ENABLE=true
VITE_ANALYZER_ENABLE=false
VITE_SOURCEMAP=false
VITE_MANUAL_CHUNKS_ENABLE=false
```

### Configuration Flags

- `VITE_RELATIVE_API_PATH`: Defines the relative path to the API entry point. This is used to configure the API gateway path.
- `VITE_COMPRESSION_ENABLE`: When set to true, it enables compression of the build files, reducing their size and improving load times. This option is primarily used for creating distributable releases and for testing with real hardware in actual environments.
- `VITE_ANALYZER_ENABLE`: Enables the bundle analyzer plugin when set to `true`. This is useful for analyzing and visualizing the size of the output files.
- `VITE_SOURCEMAP`: Controls the generation of sourcemaps. Setting this to `true` helps in debugging by mapping the compiled code back to the original source code.
- `VITE_MANUAL_CHUNKS_ENABLE`: When enabled, this allows for manual chunking of the build output, which can be particularly useful during development and testing with real hardware. This option helps to optimize the loading strategy by separating vendor code from the core code.

## Dependencies

Your module will have access to a range of peer dependencies for development, including React, React-DOM, jotai, and more, to ensure compatibility and seamless integration with the Frieren ecosystem.

## License

This template and your modules are intended to be shared under the LGPL-3.0-only License, promoting open-source collaboration and distribution.

## Notes

Developing a module for the Frieren project is an opportunity to contribute to a growing ecosystem. Your modules can add significant value, from system configuration to the management of third-party modules. Following the steps above will guide you through the process of creating, building, and sharing your module.

Happy coding!
