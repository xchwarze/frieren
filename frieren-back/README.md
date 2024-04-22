# Frieren API Backend

![Mascot](../assets/mascot-mimic-mini.png)

## Description

Frieren is a highly efficient PHP micro-framework tailored for backend development. Its lightweight design is optimized for performance across various environments, making it suitable for a range of PHP projects. Frieren's core features simplicity and flexibility, making it ideal for developers seeking a streamlined, robust backend solution without the overhead of larger frameworks.

## Features

- **Unified API Response Handling**: Employs a streamlined approach to API responses, offering tools that standardize output, making data parsing and frontend integration effortless.
- **Mini ORM**: Simplifies interactions with databases.
- **CORS Configuration**: Comes pre-configured for Cross-Origin Resource Sharing.
- **Modularity**: Designed for easy maintenance and scalability.
- **Autoload**: Efficient class loading and management (Classmap for core and PSR-4 for modules).
- **Session Management**: Incorporates advanced session handling capabilities, enabling secure and efficient user sessions across various interactions.
- **Pre-Built Modules for Enhanced Functionality**: Frieren comes with a set of pre-built modules designed to supercharge your projects. From system configuration to managing third-party integrations, these modules are ready to use or modify, streamlining your development process.

## Installation

Clone the repository and start playing!
```bash
git clone https://github.com/xchwarze/frieren
cd frieren/frieren-back
```

## Usage

After installation, include Frieren API in your PHP project to enhance routing capabilities and leverage its robust features in a minimalist setup.<br>
The general idea is that based on the current orm and helper you create the ones you need for other platforms.

### API Directory Structure
- **config/**: Contains configuration files.
- **core/**: The core framework files.
  - `ApiCore.php`: Core API functionalities.
  - `Controller.php`: Base controller.
  - `ResponseHandler.php`: Handles API responses.
  - `Router.php`: Manages module routing.
- **helper/**: Helper utilities.
  - `HelperFactory.php`: Factory class to provide system-specific helper instances.
  - `OpenWrtHelper.php`: Specific helper for OpenWrt interactions.
  - `UciConfigHelper.php`: Handles reading and parsing UCI config files in OpenWRT.
- **orm/**: Object-Relational Mapping related files.
  - `SQLite.php`: SQLite integration for ORM. Requires php7-mod-sqlite3 installed.
- **/**: Root
  - `index.php`: Autoload and framework entrypoint.

## Requirements

- PHP 7.2 or higher
- OpenWrt 19 or higher. **Other platforms can also be used**, but OpenWRT is ready to use as it is the main platform of the project.
- Other dependencies that you may need are: php7-mod-hash, php7-mod-json, php7-mod-mbstring, php7-mod-session, php7-mod-sqlite3, coreutils-nohup, uclient-fetch, usbutils, ttyd

## Contributing

Contributions are welcome! Please refer to the project's contribution guidelines for more details.

## License

This project is licensed under the LGPL-3.0-only License - see the LICENSE file in the root directory for details.

Image Licensing Information: The images used in this project are subject to their own individual licenses and specific terms. For a detailed explanation of these licenses and any applicable notes, please review our [Image Licensing Document](../assets/ASSETS_CREDITS.md).

## Authors and Acknowledgment

- **Lead Developer**: DSR! - xchwarze@gmail.com

Thank you to all the contributors and the community for supporting the Frieren project.

## Contact

For support or queries, contact xchwarze@gmail.com.
