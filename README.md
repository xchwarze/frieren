# Frieren

## Description

Frieren is a PHP micro-framework designed for use in routers and Single Board Computers (SBCs). This framework is built to be lightweight, efficient, and easy to integrate into various PHP projects.<br>
Also the project will have a sample web implementation in React or Preact. It is still under development so for the moment I only upload the api to this repo.

## Features

- **Mini ORM**: Simplifies interactions with databases.
- **CORS Configuration**: Comes pre-configured for Cross-Origin Resource Sharing.
- **Modularity**: Designed for easy maintenance and scalability.
- **Classmap Autoload**: Efficient class loading and management.

## Installation

Clone the repository and start playing!
```bash
git clone https://github.com/frieren/frieren.git
cd frieren
```

## Usage

After installation, include Frieren API in your PHP project to enhance routing capabilities and leverage its robust features in a minimalist setup.<br>
The general idea is that based on the current orm and helper you create the ones you need for other platforms.<br>
As an example you can find in [this repo](https://github.com/xchwarze/frieren-wpmk6) an implementation of the api part to be used as a replacement of the original one in the WifiPineapple MK6.

### Directory Structure
- **webapp/**: TBD
- **config/**: Contains configuration files.
- **core/**: The core framework files.
  - `ApiCore.php`: Core API functionalities.
  - `Controller.php`: Base controller.
  - `ResponseHandler.php`: Handles API responses.
  - `Router.php`: Manages module routing.
- **helper/**: Helper utilities.
  - `OpenWrtHelper.php`: Specific helper for OpenWrt interactions.
- **orm/**: Object-Relational Mapping related files.
  - `SQLite.php`: SQLite integration for ORM. Requires php7-mod-sqlite3 installed.

## Requirements

    * PHP 7.2 or higher
    * OpenWrt 19 or higher
    * Other dependencies that you may need are: at, uclient-fetch, uci, grep

## Contributing

Contributions to the Frieren are welcome. Please read the contributing guidelines before submitting your pull request.
License

This project is licensed under the LGPL-3.0-only License - see the LICENSE file for details.

## Authors and Acknowledgment

    * DSR! - xchwarze@gmail.com

## Contact

For support or queries, contact xchwarze@gmail.com.
